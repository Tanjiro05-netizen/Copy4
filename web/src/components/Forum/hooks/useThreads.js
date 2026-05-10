import { useState, useEffect, useCallback } from 'react'

export function useThreads(apiService, options = {}, userId = null) {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  })

  const { category, page = 1, limit = 20, sortBy = 'created_at' } = options

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await apiService.getThreads({
        category,
        page,
        limit,
        sortBy,
      })
      
      setThreads(result.data || [])
      setPagination({
        page: result.page || page,
        totalPages: result.totalPages || 1,
        total: result.total || 0,
      })
    } catch (err) {
      setError(err.message)
      setThreads([])
    } finally {
      setLoading(false)
    }
  }, [apiService, category, page, limit, sortBy])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  const createThread = useCallback(async (threadData) => {
    try {
      const newThread = await apiService.createThread(threadData, userId)
      setThreads(prev => [newThread, ...prev])
      return { success: true, thread: newThread }
    } catch (err) {
      return { success: false, error: err }
    }
  }, [apiService, userId])

  const updateThread = useCallback(async (threadId, updates) => {
    try {
      const updatedThread = await apiService.updateThread(threadId, updates)
      setThreads(prev => prev.map(t => t.id === threadId ? updatedThread : t))
      return { success: true, thread: updatedThread }
    } catch (err) {
      return { success: false, error: err }
    }
  }, [apiService])

  const deleteThread = useCallback(async (threadId) => {
    try {
      await apiService.deleteThread(threadId)
      setThreads(prev => prev.filter(t => t.id !== threadId))
      return { success: true }
    } catch (err) {
      return { success: false, error: err }
    }
  }, [apiService])

  return {
    threads,
    loading,
    error,
    pagination,
    refetch: fetchThreads,
    createThread,
    updateThread,
    deleteThread,
  }
}

export function useThread(apiService, threadId) {
  const [thread, setThread] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchThread = useCallback(async () => {
    if (!threadId) return
    
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getThread(threadId)
      setThread(data)
    } catch (err) {
      setError(err.message)
      setThread(null)
    } finally {
      setLoading(false)
    }
  }, [apiService, threadId])

  useEffect(() => {
    fetchThread()
  }, [fetchThread])

  return {
    thread,
    loading,
    error,
    refetch: fetchThread,
  }
}

export default useThreads
