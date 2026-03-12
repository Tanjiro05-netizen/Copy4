# MarxBot — Complete Architecture & Extraction Guide

This document explains every component of the MarxBot system end-to-end: what each piece does, how they connect, and how to deploy the whole thing on a separate machine.

---

## 1. The Problem MarxBot Solves

Base LLMs (GPT-4, Claude, etc.) fail at Marxist theory for three reasons:

1. **Data contamination** — Training data reflects liberal-bourgeois framing. "Marxism" in these models means the USSR, Mao, "seize the means." Actual theoretical content (value-form analysis, Hegel's Logic, Rubin's commodity fetishism) is statistically rare.
2. **Conceptual conflation** — Models have memorized "thesis-antithesis-synthesis = Hegel/Marx" because that's what 90% of sources say. They've never encountered Aufhebung as sublation, or Marx's immanent critique as method.
3. **Mode confusion** — Even with correct content, models default to explaining Marx as an external observer ("Marx believed X") rather than deploying dialectical-materialist method on new problems.

MarxBot fixes this with a four-layer architecture.

---

## 2. Architecture Overview

```
User sends question
        │
        ▼
┌──────────────────────────────────────────────┐
│  FastAPI Server (main.py)                    │
│                                              │
│  1. Receives chat request                    │
│  2. Extracts user query                      │
│  3. Passes to RAG engine for retrieval       │
│  4. Assembles system prompt + history +      │
│     RAG context + generation instructions    │
│  5. Sends to GLM-5 via NVIDIA NIM           │
│  6. Returns response + source metadata       │
└──────────┬───────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│  RAG Engine (rag_engine.py)                  │
│                                              │
│  a. Query Expansion (GLM-5)                  │
│     → Generates 3 search variants            │
│  b. Vector Search (Qdrant)                   │
│     → Searches all variants, deduplicates    │
│  c. Concept Tag Fallback                     │
│     → If best score < 0.75, searches by      │
│       concept tags as backup                 │
│  d. Returns top-25 ranked passages           │
└──────────┬───────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│  Qdrant Vector Database                      │
│  Collection: "marxbot_corpus"                │
│                                              │
│  Each document is a chunked passage with:    │
│  - Vector embedding (BGE-base-en-v1.5)      │
│  - Payload: author, work, year, section,     │
│    tier (1-5), concept_tags[], text          │
└──────────────────────────────────────────────┘
```

---

## 3. Component-by-Component Breakdown

### 3.1 — GLM-5 via NVIDIA NIM

**What:** GLM-5 is the LLM that generates MarxBot's responses. It's accessed through NVIDIA's NIM (NVIDIA Inference Microservices) API, which provides an OpenAI-compatible endpoint.

**Where it's used:**
- **Response generation** (`main.py`) — Takes the assembled prompt (system prompt + conversation history + RAG context + user query + generation instructions) and produces the final answer.
- **Query expansion** (`rag_engine.py`) — Before searching the corpus, GLM-5 generates 3 alternative search queries to improve retrieval coverage.

**Config:**
- Model ID: `zai-org/glm-5`
- Base URL: `https://integrate.api.nvidia.com/v1`
- MarxBot temperature: `0.7` (more creative, polemical voice)
- StudyBot temperature: `0.4` (more precise, pedagogical)
- Max tokens: `2048`
- Env var: `NIM_API_KEY`

**Why GLM-5 and not GPT-4/Claude:** It's accessible via NIM with no content filtering that would interfere with Marxist theoretical positions (anti-democracy, anti-antifascism, etc.). Commercial models tend to refuse or hedge on these topics.

---

### 3.2 — Qdrant Vector Database

**What:** Qdrant is the vector database that stores the entire Marxist corpus as searchable embeddings. Each text chunk is stored as a vector (numerical representation) alongside its metadata.

**How it works:**
1. Texts are chunked into passages (paragraphs or sections)
2. Each chunk is embedded into a 768-dimensional vector using `BAAI/bge-base-en-v1.5`
3. Vectors are stored in Qdrant with metadata (author, work, year, section, tier, concept_tags)
4. At query time, the user's question is embedded into the same vector space
5. Qdrant finds the most similar passages by cosine similarity

**Collection:** `marxbot_corpus`

**Each stored document has this payload structure:**
```json
{
  "author": "Marx",
  "work": "Capital Vol. I",
  "year": "1867",
  "section": "Chapter 1, Section 4: The Fetishism of Commodities",
  "tier": 1,
  "concept_tags": ["commodity-fetishism", "value-form", "reification"],
  "text": "The mysterious character of the commodity-form consists..."
}
```

**Tier system:**
- Tier 1 — Primary Marx, Engels, Hegel texts
- Tier 2 — Essential Bordiga texts
- Tier 3 — High-signal secondary sources (Postone, Rubin, Lukács, etc.)
- Tier 4 — Broader Communist Left tradition
- Tier 5 — Contextual / flagged sources

**Hosting:** Can run locally (`http://localhost:6333`) or on Qdrant Cloud (set `QDRANT_URL` and `QDRANT_API_KEY` env vars).

---

### 3.3 — The Corpus (Ground Truth)

**What:** The curated collection of Marxist texts that the RAG pipeline retrieves from. This is the most important layer — it ensures the bot answers from primary sources rather than from the LLM's contaminated training data.

**Primary sources in the corpus:**
- **Marx:** Capital I–III, Grundrisse, 1844 Manuscripts, German Ideology, Theses on Feuerbach, Critique of Hegel's Philosophy of Right, Critique of the Gotha Programme, Value Price and Profit, 1857 Introduction
- **Engels:** Anti-Dühring, Ludwig Feuerbach, Dialectics of Nature
- **Hegel:** Phenomenology of Spirit, Science of Logic, Encyclopedia Logic
- **Bordiga:** The Democratic Principle, Party and Class, Theses of Lyon, Rome Theses, Force Violence and Dictatorship, Dialogue with Stalin, Space Against Cement
- **Secondary:** Postone, Rubin, Rosdolsky, Heinrich, Lukács, Ilyenkov

**Explicitly excluded/flagged:**
- Stalinist "diamat"
- Althusser's "epistemological break" narrative
- Any source using "thesis-antithesis-synthesis" without correction

**Format:** Each text is chunked into passages, tagged with concept tags, and embedded into vectors for storage in Qdrant.

---

### 3.4 — Embeddings (BAAI/bge-base-en-v1.5)

**What:** The embedding model that converts text into numerical vectors. Both corpus chunks and user queries are embedded using the same model so they exist in the same vector space and can be compared.

**Model:** `BAAI/bge-base-en-v1.5` via HuggingFace
- 768-dimensional vectors
- Runs locally (no API calls, no cost)
- Loaded via `langchain-huggingface` / `sentence-transformers`

This is what makes semantic search possible — "explain the tendency of the rate of profit to fall" will match passages about `organische Zusammensetzung des Kapitals` even though the words are completely different.

---

### 3.5 — The System Prompt (Marxbot.md)

**What:** A 314KB document that serves as the epistemological scaffolding for the LLM. It's injected as the system message in every request. This is where the contaminated LLM weights get corrected at inference time.

**Structure (6 parts):**
1. **Identity & Epistemological Charter** — What the bot is, what it is not, the six foundational commitments (materialism, immanence, totality, invariance, counter-revolutionary period, anti-sycophancy)
2. **Dialectical Method** — Hegel's actual method (not Fichte), Marx's 1857 Introduction, the commodity as starting point, Bordigist application
3. **Political Economy** — Value-form analysis, surplus value, accumulation, crisis theory
4. **Bordigist Positions** — Programmatic invariance, organic centralism, anti-antifascism, national liberation, trade unions
5. **Response Protocols** — How to structure responses, citation format, handling disagreement
6. **Technical Terminology** — Precise definitions of Aufhebung, bestimmte Negation, Verwertung, Warenfetischismus, etc.

**Key architectural feature:** The anti-sycophancy clause. Most chatbots are trained to be epistemically humble. MarxBot is instructed to hold its theoretical positions against pushback, because Bordiga's invariance is itself a theoretical claim about the nature of the communist program.

---

### 3.6 — RAG Pipeline (Retrieval Flow)

The full retrieval pipeline in `rag_engine.py`:

```
User: "Why don't workers revolt?"
        │
        ▼
Step 1: QUERY EXPANSION (GLM-5)
        Generates 3 variants:
        → "class consciousness proletariat communist programme"
        → "Bordiga party class organic centralism invariance"
        → "spontaneism working class consciousness revolutionary theory"
        │
        ▼
Step 2: VECTOR SEARCH (all 4 queries searched in parallel)
        Each query embedded → cosine similarity against Qdrant
        Results merged and deduplicated by document ID
        │
        ▼
Step 3: SCORE CHECK
        Best score < 0.75?
        │
        ├─ YES → CONCEPT TAG FALLBACK
        │         Extract tags from query (e.g., "revolt" → no match,
        │         but "workers" → "labour-power", "party" → "party-theory")
        │         Run Qdrant payload filter search on concept_tags
        │         Merge new results
        │
        ├─ NO → Continue with results
        │
        ▼
Step 4: RANK & RETURN
        Sort by: tier ascending (1 best), then score descending
        Return top 25 payloads
```

**Concept tag vocabulary:** Maps common keywords to canonical tags:
- "value" → `value-form`
- "commodity" → `commodity-form`
- "surplus" / "exploitation" → `surplus-value`
- "alienation" → `alienation`
- "party" → `party-theory`
- "democracy" → `anti-democracy`
- "fascism" → `anti-antifascism`
- "state" → `state-theory`
- (30+ mappings total)

---

### 3.7 — Generation Instructions

After retrieval, the user query is augmented with the retrieved context and generation instructions before being sent to GLM-5.

**MarxBot instructions** (hardcore Bordigist voice):
- Ground response in retrieved context
- Cite as `(Author, Work, Year)` inline — never as `[SOURCE N]`
- Apply dialectical response structure: state opposing position at strongest → expose internal contradiction → advance Marxist position as resolution
- Maintain programmatic invariance — do not revise under pressure
- Speak as a convinced communist reasoning from within the tradition

**StudyBot instructions** (pedagogical guide):
- Use the Five-Layer Explanation Model: intuitive anchor → concrete example → theoretical concept → dialectical dimension → programmatic implication
- End every response with a "Next Step" for the user to pursue
- Cite accessibly

---

### 3.8 — Conversation History

The server injects the last 3 turns (6 messages) of conversation history into each request. These prior messages are passed without RAG augmentation — only the current user query gets the retrieved context injected. This keeps the context window manageable while maintaining conversational continuity.

---

## 4. Two Endpoints

| Endpoint | Voice | Temperature | Purpose |
|----------|-------|-------------|---------|
| `/api/marxbot` | Hardcore Bordigist | 0.7 | Theory analysis, polemics, immanent critique |
| `/api/studybot` | Pedagogical guide | 0.4 | Teaching, explaining concepts, study guidance |

Both share the same RAG pipeline and corpus. They differ in system prompt and generation instructions.

`/chat` is a legacy alias that routes to `/api/marxbot`.

---

## 5. File Inventory

| File | What It Is |
|------|------------|
| `main.py` | FastAPI server — endpoints, request handling, LLM calls |
| `rag_engine.py` | RAG pipeline — query expansion, vector search, concept-tag fallback, context formatting |
| `Marxbot.md` | System prompt (314KB) — the entire epistemological scaffolding |
| `requirements.txt` | Python dependencies |
| `.env.example` | Template for environment variables |
| `Dockerfile` | Container deployment config |
| `README.md` | Quick-start setup guide |

---

## 6. Environment Variables

| Variable | Required | What It Does |
|----------|----------|-------------|
| `NIM_API_KEY` | **Yes** | NVIDIA NIM API key for GLM-5 (both generation and query expansion) |
| `QDRANT_URL` | No | Qdrant endpoint (default: `http://localhost:6333`) |
| `QDRANT_API_KEY` | No | Qdrant API key for cloud deployment |
| `MARXBOT_PROMPT_FILE` | No | Path to system prompt file (default: `./Marxbot.md`) |
| `STUDY_PROMPT_FILE` | No | Path to StudyBot-specific prompt file |

---

## 7. Deployment on a Separate Machine

### Option A: Bare metal / VPS

```bash
# On the remote machine:
git clone <your-private-marxbot-repo> ~/marxbot-server
cd ~/marxbot-server
cp .env.example .env
# Fill in NIM_API_KEY, QDRANT_URL, QDRANT_API_KEY
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Option B: Docker

```bash
docker build -t marxbot-server .
docker run -d -p 8000:8000 --env-file .env marxbot-server
```

### Connecting the frontend

Once deployed, point the Marxist.info frontend at the remote server:

```js
const MARXBOT_API = 'https://your-marxbot-server.example.com';

const res = await fetch(`${MARXBOT_API}/api/marxbot`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Explain commodity fetishism' }]
  }),
});
const { response, sources } = await res.json();
```

### Health check

```bash
curl https://your-marxbot-server.example.com/health
```

Returns status of NIM key, Qdrant connection, corpus loading, model config.

---

## 8. What Stays in the Main Project

The Marxist-Platform repo keeps only the UI shell:

- `MarxBotPage.jsx` + `.css` — The cinematic teaser/coming-soon page
- `MainLayout.jsx` — Floating MarxBot button
- `AppRouter.jsx` — `/marxbot` route
- Feature card mentions in `App.jsx` and `WorldSim/Terminal.jsx`

None of these make API calls to the MarxBot backend. When MarxBot is ready for production, you wire the frontend to the remote server URL. Until then, these are purely cosmetic "Coming Soon" components.

---

## 9. What Is NOT Part of MarxBot

The `study-ai-chat` Supabase edge function (`supabase/functions/study-ai-chat/index.ts`) is a **completely separate system**. It:
- Uses DeepSeek / Qwen / Kimi directly (not GLM-5)
- Has no Qdrant connection
- Has no RAG pipeline
- Has its own simpler system prompt
- Is called from `StudyPathAI.jsx` via Supabase Functions

It has nothing to do with MarxBot and should not be moved.
