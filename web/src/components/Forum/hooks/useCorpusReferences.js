import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../supabaseClient'

/**
 * Fetches semantically related passages from the Marxist corpus
 * for a given piece of text (thread content).
 *
 * Uses the `corpus-search` Supabase Edge Function which embeds the text
 * and queries the Qdrant `marxbot_corpus` collection.
 *
 * @param {string|null} text - The text to search for (thread content). Null skips the call.
 * @param {number} topK - Number of passages to return (default 5, max 10).
 */
export function useCorpusReferences(text, topK = 5) {
  const [passages, setPassages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const lastText = useRef(null)

  useEffect(() => {
    if (!text || text === lastText.current) return
    lastText.current = text

    let cancelled = false
    setLoading(true)
    setError(null)

    supabase.functions
      .invoke('corpus-search', {
        body: { text, top_k: topK },
      })
      .then(({ data, error: fnError }) => {
        if (cancelled) return
        if (fnError) {
          setError(fnError.message || 'Corpus search failed')
          setPassages([])
        } else {
          setPassages(data?.passages || [])
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Corpus search failed')
          setPassages([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [text, topK])

  return { passages, loading, error }
}

export default useCorpusReferences
