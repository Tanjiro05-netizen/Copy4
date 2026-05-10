import { useState, useEffect, useCallback } from 'react'

export function useAnswers(apiService, questionId) {
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAnswers = useCallback(async () => {
    if (!questionId) {
      setAnswers([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await apiService.getAnswers(questionId)
      setAnswers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [apiService, questionId])

  useEffect(() => {
    fetchAnswers()
  }, [fetchAnswers])

  const createAnswer = useCallback(async (content) => {
    const result = await apiService.createAnswer({
      question_id: questionId,
      content,
    })
    if (result.success) {
      // Add to local state (will show as pending)
      setAnswers(prev => [...prev, result.answer])
    }
    return result
  }, [apiService, questionId])

  return {
    answers,
    loading,
    error,
    createAnswer,
    refetch: fetchAnswers,
  }
}

export default useAnswers
