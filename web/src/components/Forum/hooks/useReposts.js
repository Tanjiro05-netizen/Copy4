import { useState, useCallback, useEffect } from 'react'

export function useReposts(apiService, userId) {
  const [repostedIds, setRepostedIds] = useState(new Set())
  const [loading, setLoading] = useState(false)

  const fetchUserReposts = useCallback(async () => {
    if (!userId) {
      setRepostedIds(new Set())
      return
    }
    
    try {
      setLoading(true)
      const ids = await apiService.getUserRepostIds(userId)
      setRepostedIds(new Set(ids))
    } catch (err) {
      console.error('Failed to fetch reposts:', err)
    } finally {
      setLoading(false)
    }
  }, [apiService, userId])

  useEffect(() => {
    fetchUserReposts()
  }, [fetchUserReposts])

  const isReposted = useCallback((threadId) => {
    return repostedIds.has(threadId)
  }, [repostedIds])

  const repost = useCallback(async (threadId, quoteContent = null) => {
    if (!userId) return { success: false, error: 'Not authenticated' }
    
    // Optimistic update
    setRepostedIds(prev => {
      const next = new Set(prev)
      next.add(threadId)
      return next
    })
    
    try {
      const result = await apiService.repost(threadId, quoteContent)
      if (!result.success) {
        // Rollback on error
        setRepostedIds(prev => {
          const next = new Set(prev)
          next.delete(threadId)
          return next
        })
      }
      return result
    } catch (err) {
      // Rollback on error
      setRepostedIds(prev => {
        const next = new Set(prev)
        next.delete(threadId)
        return next
      })
      return { success: false, error: err }
    }
  }, [apiService, userId])

  const unrepost = useCallback(async (threadId) => {
    if (!userId) return { success: false, error: 'Not authenticated' }
    
    const wasReposted = repostedIds.has(threadId)
    
    // Optimistic update
    setRepostedIds(prev => {
      const next = new Set(prev)
      next.delete(threadId)
      return next
    })
    
    try {
      const result = await apiService.unrepost(threadId)
      if (!result.success && wasReposted) {
        // Rollback on error
        setRepostedIds(prev => {
          const next = new Set(prev)
          next.add(threadId)
          return next
        })
      }
      return result
    } catch (err) {
      // Rollback on error
      if (wasReposted) {
        setRepostedIds(prev => {
          const next = new Set(prev)
          next.add(threadId)
          return next
        })
      }
      return { success: false, error: err }
    }
  }, [apiService, userId, repostedIds])

  const toggleRepost = useCallback(async (threadId, quoteContent = null) => {
    if (isReposted(threadId)) {
      return await unrepost(threadId)
    } else {
      return await repost(threadId, quoteContent)
    }
  }, [isReposted, repost, unrepost])

  return {
    isReposted,
    repost,
    unrepost,
    toggleRepost,
    fetchUserReposts,
    loading,
  }
}

export default useReposts
