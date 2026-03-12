"""
main.py — MarxBot FastAPI Server v2.0
Enhancements over v1:
  - LLM: GLM-5 via NVIDIA NIM (replaces DeepSeek)
  - Conversation history injection: last 3 turns (6 messages) passed to model
  - MarxBot: temperature=0.7, max_tokens=2048
  - StudyBot: temperature=0.4, max_tokens=2048 (separate endpoint + prompt)
  - /api/marxbot  — hardcore Bordigist voice
  - /api/studybot — pedagogical Communist Left guide
  - /health       — health check with config status
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

from rag_engine import (
    MarxBotEngine,
    GENERATION_INSTRUCTIONS,
    GENERATION_INSTRUCTIONS_STUDY,
)

load_dotenv()

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
NIM_API_KEY  = os.environ.get("NIM_API_KEY")
NIM_BASE_URL = "https://integrate.api.nvidia.com/v1"
GLM_MODEL    = "zai-org/glm-5"

MARXBOT_TEMPERATURE  = 0.7
STUDYBOT_TEMPERATURE = 0.4
MAX_TOKENS           = 2048

# Last N turns to inject (1 turn = 1 user + 1 assistant message)
HISTORY_TURNS    = 3
HISTORY_MESSAGES = HISTORY_TURNS * 2   # = 6

# ─────────────────────────────────────────────
# APP
# ─────────────────────────────────────────────
app = FastAPI(
    title="MarxBot API",
    description="Communist Left theory bot — MarxBot (Bordigist) + StudyBot",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = MarxBotEngine()

if not NIM_API_KEY:
    print("[WARN] NIM_API_KEY not set — LLM calls will fail.")

nim_client = AsyncOpenAI(
    api_key=NIM_API_KEY or "placeholder",
    base_url=NIM_BASE_URL
)

# ─────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[dict] = []

# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
def extract_user_query(messages: List[ChatMessage]) -> str:
    for msg in reversed(messages):
        if msg.role == "user":
            return msg.content
    return ""


def build_history_window(messages: List[ChatMessage]) -> List[ChatMessage]:
    """
    Return last HISTORY_MESSAGES prior messages, excluding the current
    user query (last item). These are injected without RAG augmentation
    so the model retains conversational continuity without inflating the
    context with repeated corpus passages.
    """
    prior = messages[:-1] if messages else []
    return prior[-HISTORY_MESSAGES:]


# ─────────────────────────────────────────────
# SHARED PIPELINE
# ─────────────────────────────────────────────
async def run_chat(
    request: ChatRequest,
    system_prompt: str,
    generation_instructions: str,
    temperature: float,
) -> ChatResponse:

    if not NIM_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="NIM_API_KEY not configured. Add it to your .env file."
        )

    user_query = extract_user_query(request.messages)
    if not user_query:
        raise HTTPException(status_code=400, detail="No user message found.")

    try:
        # 1. RAG retrieval (query expansion + tag fallback inside engine)
        payloads = await engine.retrieve_context(user_query)
        context_block = engine.format_retrieved_context(payloads)

        # 2. Assemble message array
        messages_for_llm = []

        # System prompt
        messages_for_llm.append({"role": "system", "content": system_prompt})

        # Prior conversation history (clean, no RAG injection)
        for msg in build_history_window(request.messages):
            messages_for_llm.append({"role": msg.role, "content": msg.content})

        # Current user message — augmented with RAG context
        augmented = (
            f"{context_block}\n\n"
            f"[USER QUERY]\n{user_query}\n[/USER QUERY]\n\n"
            f"{generation_instructions}"
        )
        messages_for_llm.append({"role": "user", "content": augmented})

        # 3. LLM call
        response = await nim_client.chat.completions.create(
            model=GLM_MODEL,
            messages=messages_for_llm,
            max_tokens=MAX_TOKENS,
            temperature=temperature,
        )

        reply = response.choices[0].message.content

        # 4. Source metadata for frontend
        sources = [
            {
                "author":  p.get("author"),
                "work":    p.get("work"),
                "year":    p.get("year"),
                "tier":    p.get("tier"),
                "section": p.get("section"),
                "tags":    p.get("concept_tags", []),
            }
            for p in payloads
        ]

        return ChatResponse(response=reply, sources=sources)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────
@app.post("/api/marxbot", response_model=ChatResponse)
async def marxbot_endpoint(request: ChatRequest):
    """MarxBot — hardcore Bordigist voice. Temperature 0.7."""
    return await run_chat(
        request=request,
        system_prompt=engine.system_prompt_marxbot,
        generation_instructions=GENERATION_INSTRUCTIONS,
        temperature=MARXBOT_TEMPERATURE,
    )


@app.post("/api/studybot", response_model=ChatResponse)
async def studybot_endpoint(request: ChatRequest):
    """StudyBot — pedagogical Communist Left guide. Temperature 0.4."""
    return await run_chat(
        request=request,
        system_prompt=engine.system_prompt_studybot,
        generation_instructions=GENERATION_INSTRUCTIONS_STUDY,
        temperature=STUDYBOT_TEMPERATURE,
    )


@app.post("/chat", response_model=ChatResponse)
async def chat_legacy(request: ChatRequest):
    """Backwards-compatible alias — routes to /api/marxbot."""
    return await marxbot_endpoint(request)


@app.get("/health")
async def health_check():
    nim_ok = bool(NIM_API_KEY)
    qdrant_ok = True
    corpus_loaded = False
    collection_names = []

    try:
        collections = engine.qdrant.get_collections()
        collection_names = [c.name for c in collections.collections]
        corpus_loaded = "marxbot_corpus" in collection_names
    except Exception as e:
        qdrant_ok = False
        collection_names = [f"ERROR: {e}"]

    return {
        "status":        "healthy" if (nim_ok and qdrant_ok and corpus_loaded) else "degraded",
        "nim_key":       "set" if nim_ok else "MISSING",
        "qdrant":        "connected" if qdrant_ok else "ERROR",
        "corpus_loaded": corpus_loaded,
        "collections":   collection_names,
        "model":         GLM_MODEL,
        "top_k":         25,
        "history_turns": HISTORY_TURNS,
        "marxbot_temp":  MARXBOT_TEMPERATURE,
        "studybot_temp": STUDYBOT_TEMPERATURE,
        "max_tokens":    MAX_TOKENS,
    }
