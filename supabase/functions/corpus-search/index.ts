import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const QDRANT_URL = Deno.env.get('QDRANT_URL') || 'http://localhost:6333'
const QDRANT_API_KEY = Deno.env.get('QDRANT_API_KEY') || ''
const HF_API_KEY = Deno.env.get('HF_API_KEY') || ''

const COLLECTION = 'marxbot_corpus'
const EMBEDDING_MODEL = 'BAAI/bge-base-en-v1.5'
const DEFAULT_TOP_K = 5
const SCORE_THRESHOLD = 0.55

/**
 * Get embedding vector from HuggingFace Inference API.
 * Model: BAAI/bge-base-en-v1.5 (768-dim, same as MarxBot corpus).
 */
async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch(
    `https://api-inference.huggingface.co/pipeline/feature-extraction/${EMBEDDING_MODEL}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text,
        options: { wait_for_model: true },
      }),
    }
  )

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`HuggingFace embedding failed (${response.status}): ${errText}`)
  }

  const embedding = await response.json()
  // HF returns a nested array for single input: [[0.1, 0.2, ...]]
  return Array.isArray(embedding[0]) ? embedding[0] : embedding
}

/**
 * Query Qdrant for similar passages using the embedding vector.
 */
async function searchQdrant(
  vector: number[],
  topK: number
): Promise<Array<{ score: number; payload: Record<string, unknown> }>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (QDRANT_API_KEY) {
    headers['api-key'] = QDRANT_API_KEY
  }

  const response = await fetch(
    `${QDRANT_URL}/collections/${COLLECTION}/points/query`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: vector,
        limit: topK,
        score_threshold: SCORE_THRESHOLD,
        with_payload: true,
      }),
    }
  )

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Qdrant search failed (${response.status}): ${errText}`)
  }

  const data = await response.json()
  return (data.result?.points || []).map((pt: any) => ({
    score: pt.score,
    payload: pt.payload,
  }))
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, top_k } = await req.json()

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'text field is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!HF_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'HF_API_KEY not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (!QDRANT_URL || QDRANT_URL === 'http://localhost:6333') {
      console.warn('[corpus-search] Using localhost Qdrant — set QDRANT_URL for production')
    }

    // Truncate to first 500 chars to keep embedding cost/latency low
    const truncated = text.slice(0, 500)
    const topK = Math.min(Math.max(top_k || DEFAULT_TOP_K, 1), 10)

    // Step 1: Embed the text
    const vector = await getEmbedding(truncated)

    // Step 2: Search Qdrant
    const results = await searchQdrant(vector, topK)

    // Step 3: Format response
    const passages = results.map((r) => ({
      author: r.payload.author || 'Unknown',
      work: r.payload.work || 'Unknown',
      year: r.payload.year || null,
      section: r.payload.section || null,
      text: typeof r.payload.text === 'string' ? r.payload.text.slice(0, 300) : '',
      score: Math.round(r.score * 1000) / 1000,
      concept_tags: Array.isArray(r.payload.concept_tags) ? r.payload.concept_tags : [],
    }))

    return new Response(
      JSON.stringify({ passages }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('[corpus-search] Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message, passages: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
