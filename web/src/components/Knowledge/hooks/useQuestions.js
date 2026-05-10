import { useState, useEffect, useCallback } from 'react'

export function useQuestions(apiService, options = {}) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 })

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiService.getQuestions(options)
      setQuestions(result.data)
      setPagination({
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [apiService, options.topicSlug, options.page, options.sortBy])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  return {
    questions,
    loading,
    error,
    pagination,
    refetch: fetchQuestions,
  }
}

export function useQuestion(apiService, questionId) {
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!questionId) {
      setQuestion(null)
      setLoading(false)
      return
    }

    const fetchQuestion = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await apiService.getQuestion(questionId)
        setQuestion(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchQuestion()
  }, [apiService, questionId])

  return { question, loading, error }
}

export default useQuestions
