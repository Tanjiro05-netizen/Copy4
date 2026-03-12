# MarxBot Server

Standalone FastAPI server for MarxBot (Bordigist theory bot) and StudyBot (pedagogical guide).

## Architecture

- **FastAPI** server with two endpoints: `/api/marxbot` and `/api/studybot`
- **Qdrant** vector database for RAG retrieval over curated Marxist corpus
- **NVIDIA NIM (GLM-5)** for LLM inference and query expansion
- **HuggingFace BGE** embeddings for semantic search

## Setup

```bash
# 1. Copy .env.example and fill in your keys
cp .env.example .env

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the server
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Docker

```bash
docker build -t marxbot-server .
docker run -p 8000:8000 --env-file .env marxbot-server
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/marxbot` | MarxBot — hardcore Bordigist voice (temp 0.7) |
| POST | `/api/studybot` | StudyBot — pedagogical guide (temp 0.4) |
| POST | `/chat` | Legacy alias → `/api/marxbot` |
| GET | `/health` | Health check with config status |

## Request Format

```json
{
  "messages": [
    { "role": "user", "content": "Explain the tendency of the rate of profit to fall" }
  ],
  "session_id": "optional-session-id"
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NIM_API_KEY` | Yes | NVIDIA NIM API key for GLM-5 |
| `QDRANT_URL` | No | Qdrant URL (default: `http://localhost:6333`) |
| `QDRANT_API_KEY` | No | Qdrant API key (for cloud) |
| `MARXBOT_PROMPT_FILE` | No | Path to system prompt (default: `./Marxbot.md`) |
| `STUDY_PROMPT_FILE` | No | Path to StudyBot prompt |

## Connecting from the Frontend

Point your frontend to this server's URL. Example:

```js
const MARXBOT_API = 'https://your-marxbot-server.com';

const response = await fetch(`${MARXBOT_API}/api/marxbot`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: query }] }),
});
const data = await response.json();
```
