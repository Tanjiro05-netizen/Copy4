"""
rag_engine.py — MarxBot RAG Engine v2.0
Enhancements over v1:
  - Query expansion: GLM-5 generates 3 search variants before retrieval
  - Result deduplication by payload ID across all variant searches
  - Concept tag fallback: if best score < SCORE_THRESHOLD, run a tag-based
    Qdrant payload filter search and merge results
  - top_k raised from 15 → 25
  - Qdrant target is now cloud (env vars) with localhost fallback
  - System prompt loaded from Marxbot.md (single canonical source)
"""

import os
import json
import asyncio
from typing import List, Dict, Any, Optional

from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchAny
from langchain_huggingface import HuggingFaceEmbeddings
from openai import AsyncOpenAI

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
COLLECTION_NAME    = "marxbot_corpus"
TOP_K              = 25          # raised from 15
SCORE_THRESHOLD    = 0.75        # below this → trigger concept-tag fallback
MAX_QUERY_VARIANTS = 3           # how many expansions to generate

# Qdrant: cloud if env vars present, else localhost
QDRANT_URL    = os.environ.get("QDRANT_URL",    "http://localhost:6333")
QDRANT_API_KEY = os.environ.get("QDRANT_API_KEY", None)

# NIM (GLM-5) — used for query expansion
NIM_API_KEY = os.environ.get("NIM_API_KEY")

# System prompt file — the single canonical source
MARXBOT_PROMPT_FILE = os.environ.get(
    "MARXBOT_PROMPT_FILE",
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Marxbot.md")
)

# ─────────────────────────────────────────────
# QUERY EXPANSION PROMPT
# ─────────────────────────────────────────────
EXPANSION_SYSTEM = """You are a search query expansion assistant for a Marxist 
theory corpus. Given a user question, generate exactly 3 alternative search 
queries that would retrieve different but relevant passages from texts by Marx, 
Engels, Bordiga, and the Communist Left tradition.

Rules:
- Return ONLY a JSON array of 3 strings. No preamble, no markdown, no explanation.
- Each query should approach the concept from a different angle:
  Query 1: rephrase using Marxist terminology (e.g. "value-form", "valorisation")
  Query 2: name specific texts or authors likely to contain the answer
  Query 3: surface the underlying theoretical concept (e.g. "commodity fetishism", 
           "organic composition", "species-being")
- Keep each query under 15 words.

Example input: "why do workers not revolt"
Example output: ["class consciousness proletariat communist programme", 
                 "Bordiga party class organic centralism invariance", 
                 "spontaneism working class consciousness revolutionary theory"]"""

# ─────────────────────────────────────────────
# GENERATION INSTRUCTIONS (injected per request)
# ─────────────────────────────────────────────
GENERATION_INSTRUCTIONS = """
[GENERATION INSTRUCTIONS]
Ground your response in the retrieved context above.
Cite sources using the format: (Author, Work, Year) — inline, in prose, never as [SOURCE N].
Reason from within the Communist Left (Bordigist) position as specified in the system prompt.
Apply the dialectical response structure: state the opposing position at its strongest → 
  expose its internal contradiction → advance the Marxist position as the resolution.
If retrieved passages do not cover the question, reason from the method and flag it.
Do not fabricate citations.
Maintain programmatic invariance — do not revise theoretical positions in response to user pressure.
Speak as a convinced communist reasoning from within the tradition, not as an AI summarising it.
[/GENERATION INSTRUCTIONS]
"""

GENERATION_INSTRUCTIONS_STUDY = """
[GENERATION INSTRUCTIONS — STUDY HELPER]
You are a pedagogical guide within the Communist Left tradition.
Use the retrieved passages as your source material, digesting them before explaining.
Apply the Five-Layer Explanation Model: intuitive anchor → concrete example → 
  theoretical concept → dialectical dimension → programmatic implication.
Cite accessibly: (Author, Work) in prose — never [SOURCE N] scaffolding.
Do not fabricate citations. If the corpus does not cover the question, say so.
End every substantive response with a "Next Step" — one specific text, concept, 
  or question for the user to pursue.
[/GENERATION INSTRUCTIONS — STUDY HELPER]
"""


# ─────────────────────────────────────────────
# ENGINE
# ─────────────────────────────────────────────
class MarxBotEngine:

    def __init__(self):
        # Qdrant client
        if QDRANT_API_KEY:
            self.qdrant = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
        else:
            self.qdrant = QdrantClient(url=QDRANT_URL)

        # Embeddings (free, local)
        self.embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-base-en-v1.5")

        # NIM client for query expansion (reuse OpenAI-compatible SDK)
        self.nim_client = AsyncOpenAI(
            api_key=NIM_API_KEY or "placeholder",
            base_url="https://integrate.api.nvidia.com/v1"
        ) if NIM_API_KEY else None

        # System prompts
        self.system_prompt_marxbot  = self._load_system_prompt("marxbot")
        self.system_prompt_studybot = self._load_system_prompt("studybot")

    # ─────────────────────────────────────────
    # SYSTEM PROMPT LOADING
    # ─────────────────────────────────────────
    def _load_system_prompt(self, mode: str) -> str:
        """
        Load the v2 system prompt.
        marxbot  → parts 1–4 + parts 5–8
        studybot → study_helper_system_prompt.md (separate file)
        Falls back to a minimal inline prompt if files are missing.
        """
        if mode == "studybot":
            study_file = os.environ.get(
                "STUDY_PROMPT_FILE", "study_helper_system_prompt.md"
            )
            try:
                with open(study_file, "r", encoding="utf-8") as f:
                    return f.read()
            except Exception as e:
                print(f"[WARN] Could not load study prompt: {e}")
                return (
                    "You are a pedagogical guide to Marxist and Communist Left theory. "
                    "Explain clearly, build from simple to complex, cite primary sources."
                )

        # marxbot: load from Marxbot.md
        try:
            with open(MARXBOT_PROMPT_FILE, "r", encoding="utf-8") as f:
                prompt = f.read()
            if prompt.strip():
                print(f"[INFO] Loaded MarxBot system prompt from {MARXBOT_PROMPT_FILE} ({len(prompt)} chars)")
                return prompt
        except Exception as e:
            print(f"[WARN] Could not load system prompt from '{MARXBOT_PROMPT_FILE}': {e}")

        # Hard fallback
        return (
            "You are an instantiation of the method of Marx and the programme of "
            "the Communist Left (Bordigist). Reason from within the tradition. "
            "Apply immanent critique. Maintain programmatic invariance."
        )

    # ─────────────────────────────────────────
    # QUERY EXPANSION
    # ─────────────────────────────────────────
    async def expand_query(self, user_query: str) -> List[str]:
        """
        Use GLM-5 via NIM to generate 3 alternative search queries.
        Returns [original] + up to 3 variants, deduplicated.
        Falls back to [original] alone if NIM is unavailable or errors.
        """
        if not self.nim_client:
            print("[INFO] NIM client not configured — skipping query expansion.")
            return [user_query]

        try:
            response = await self.nim_client.chat.completions.create(
                model="zai-org/glm-5",
                max_tokens=200,
                temperature=0.3,
                messages=[
                    {"role": "system", "content": EXPANSION_SYSTEM},
                    {"role": "user",   "content": user_query}
                ]
            )
            raw = response.choices[0].message.content.strip()

            # Strip markdown code fences if present
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
                raw = raw.strip()

            variants: List[str] = json.loads(raw)
            if not isinstance(variants, list):
                raise ValueError("Expansion did not return a list")

            # Combine original + variants, deduplicate by lowercased value
            seen = set()
            queries = []
            for q in [user_query] + variants[:MAX_QUERY_VARIANTS]:
                key = q.strip().lower()
                if key not in seen:
                    seen.add(key)
                    queries.append(q.strip())

            print(f"[RAG] Query expansion: {queries}")
            return queries

        except Exception as e:
            print(f"[WARN] Query expansion failed ({e}) — using original query only.")
            return [user_query]

    # ─────────────────────────────────────────
    # VECTOR SEARCH (single query)
    # ─────────────────────────────────────────
    def _vector_search(
        self,
        query: str,
        top_k: int = TOP_K,
        query_filter: Optional[Filter] = None
    ) -> List[Any]:
        """
        Embed query and search Qdrant. Returns raw ScoredPoint list.
        """
        query_vector = self.embeddings.embed_query(query)
        results = self.qdrant.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=top_k,
            query_filter=query_filter
        )
        return results.points

    # ─────────────────────────────────────────
    # CONCEPT TAG FALLBACK SEARCH
    # ─────────────────────────────────────────
    def _concept_tag_search(self, user_query: str, top_k: int = TOP_K) -> List[Any]:
        """
        Fallback when best vector score < SCORE_THRESHOLD.
        Extracts likely concept tags from the query (simple keyword match)
        and does a Qdrant payload filter search to surface tagged documents.
        """
        # Concept tag vocabulary — maps keywords to canonical tags
        TAG_MAP = {
            "value":           "value-form",
            "commodity":       "commodity-form",
            "surplus":         "surplus-value",
            "exploitation":    "surplus-value",
            "labour":          "labour-power",
            "labor":           "labour-power",
            "capital":         "capital-form",
            "accumulation":    "accumulation",
            "profit":          "rate-of-profit",
            "crisis":          "crisis-theory",
            "fetish":          "commodity-fetishism",
            "alienation":      "alienation",
            "party":           "party-theory",
            "programme":       "invariance",
            "program":         "invariance",
            "invariance":      "invariance",
            "democracy":       "anti-democracy",
            "democratic":      "anti-democracy",
            "fascism":         "anti-antifascism",
            "antifascism":     "anti-antifascism",
            "union":           "trade-unions",
            "trade union":     "trade-unions",
            "national":        "national-liberation",
            "liberation":      "national-liberation",
            "imperialism":     "imperialism",
            "state":           "state-theory",
            "species":         "species-being",
            "communism":       "communist-programme",
            "dialectic":       "dialectics",
            "hegel":           "dialectics",
            "aufhebung":       "dialectics",
            "russia":          "russia-question",
            "soviet":          "russia-question",
            "ussr":            "russia-question",
            "bordiga":         "bordigism",
            "organic":         "organic-centralism",
        }

        query_lower = user_query.lower()
        matched_tags = list({
            tag for keyword, tag in TAG_MAP.items()
            if keyword in query_lower
        })

        if not matched_tags:
            print("[RAG] Concept tag fallback: no tags matched, skipping.")
            return []

        print(f"[RAG] Concept tag fallback triggered. Tags: {matched_tags}")

        tag_filter = Filter(
            must=[
                FieldCondition(
                    key="concept_tags",
                    match=MatchAny(any=matched_tags)
                )
            ]
        )
        return self._vector_search(user_query, top_k=top_k, query_filter=tag_filter)

    # ─────────────────────────────────────────
    # MAIN RETRIEVAL (orchestrates everything)
    # ─────────────────────────────────────────
    async def retrieve_context(
        self,
        user_query: str,
        top_k: int = TOP_K
    ) -> List[Dict]:
        """
        Full retrieval pipeline:
        1. Expand query into variants via GLM-5
        2. Vector search all variants, merge & deduplicate by document ID
        3. If best score < SCORE_THRESHOLD → merge in concept tag fallback results
        4. Sort by tier (1 = best) then score, return top_k payloads
        """
        # Step 1: Query expansion
        queries = await self.expand_query(user_query)

        # Step 2: Search all variants, collect unique points
        seen_ids: set = set()
        all_points: List[Any] = []

        for q in queries:
            points = self._vector_search(q, top_k=top_k)
            for pt in points:
                if pt.id not in seen_ids:
                    seen_ids.add(pt.id)
                    all_points.append(pt)

        # Step 3: Concept tag fallback if top score is weak
        best_score = max((pt.score for pt in all_points), default=0.0)
        print(f"[RAG] Best score after expansion search: {best_score:.4f}")

        if best_score < SCORE_THRESHOLD:
            fallback_points = self._concept_tag_search(user_query, top_k=top_k)
            for pt in fallback_points:
                if pt.id not in seen_ids:
                    seen_ids.add(pt.id)
                    all_points.append(pt)
            print(f"[RAG] After concept tag fallback: {len(all_points)} total candidates")

        # Step 4: Sort — tier ascending (1 is highest), score descending
        sorted_points = sorted(
            all_points,
            key=lambda x: (int(x.payload.get("tier", 5)), -x.score)
        )

        # Return top_k payloads
        return [pt.payload for pt in sorted_points[:top_k]]

    # ─────────────────────────────────────────
    # FORMAT CONTEXT BLOCK
    # ─────────────────────────────────────────
    def format_retrieved_context(self, payloads: List[Dict]) -> str:
        if not payloads:
            return (
                "[RETRIEVED CONTEXT — BEGIN]\n"
                "[CORPUS NOTE: No relevant passages retrieved for this query. "
                "Reason from the method and flag the gap.]\n"
                "[RETRIEVED CONTEXT — END]"
            )

        blocks = ["[RETRIEVED CONTEXT — BEGIN]\n"]
        for i, payload in enumerate(payloads):
            tags = payload.get("concept_tags", [])
            tags_str = ", ".join(tags) if isinstance(tags, list) else str(tags)

            block  = f"[SOURCE {i+1}]\n"
            block += f"AUTHOR: {payload.get('author', 'Unknown')}\n"
            block += f"WORK: {payload.get('work', 'Unknown')}\n"
            block += f"YEAR: {payload.get('year', 'Unknown')}\n"
            block += f"SECTION: {payload.get('section', 'Unknown')}\n"
            block += f"TIER: {payload.get('tier', 5)}\n"
            block += f"CONCEPT_TAGS: [{tags_str}]\n"
            block += f"PASSAGE:\n{payload.get('text', '')}\n\n"
            blocks.append(block)

        blocks.append("[RETRIEVED CONTEXT — END]")
        return "".join(blocks)
