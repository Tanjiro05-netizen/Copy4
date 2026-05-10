import { useState, useCallback, useEffect } from 'react'

export function useVotes(apiService, userId, targetType) {
  const [votes, setVotes] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) {
      setVotes({})
      return
    }

    const fetchVotes = async () => {
      setLoading(true)
      const data = await apiService.getUserVotes(userId, targetType)
      setVotes(data)
      setLoading(false)
    }

    fetchVotes()
  }, [apiService, userId, targetType])

  const getVote = useCallback((targetId) => {
    return votes[targetId] || null
  }, [votes])

  const vote = useCallback(async (targetId, voteType) => {
    if (!userId) return { success: false, error: 'Not authenticated' }

    const currentVote = votes[targetId]
    
    // Optimistic update
    setVotes(prev => {
      const next = { ...prev }
      if (currentVote === voteType) {
        delete next[targetId]
      } else {
        next[targetId] = voteType
      }
      return next
    })

    const result = await apiService.vote(targetType, targetId, voteType)
    
    if (!result.success) {
      // Rollback on error
      setVotes(prev => {
        const next = { ...prev }
        if (currentVote) {
          next[targetId] = currentVote
        } else {
          delete next[targetId]
        }
        return next
      })
    }

    return result
  }, [apiService, userId, targetType, votes])

  return {
    getVote,
    vote,
    loading,
  }
}

export default useVotes
