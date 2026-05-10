import { useState, useEffect, useCallback } from 'react'

export function useTopics(apiService) {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true)
      const data = await apiService.getTopics()
      setTopics(data)
      setLoading(false)
    }

    fetchTopics()
  }, [apiService])

  return { topics, loading }
}

export function useTopicFollows(apiService, userId) {
  const [followedTopics, setFollowedTopics] = useState(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) {
      setFollowedTopics(new Set())
      return
    }

    const fetchFollows = async () => {
      setLoading(true)
      const ids = await apiService.getUserFollowedTopics(userId)
      setFollowedTopics(new Set(ids))
      setLoading(false)
    }

    fetchFollows()
  }, [apiService, userId])

  const isFollowing = useCallback((topicId) => {
    return followedTopics.has(topicId)
  }, [followedTopics])

  const toggleFollow = useCallback(async (topicId) => {
    if (!userId) return { success: false }

    const wasFollowing = followedTopics.has(topicId)

    // Optimistic update
    setFollowedTopics(prev => {
      const next = new Set(prev)
      if (wasFollowing) {
        next.delete(topicId)
      } else {
        next.add(topicId)
      }
      return next
    })

    const result = wasFollowing
      ? await apiService.unfollowTopic(topicId)
      : await apiService.followTopic(topicId)

    if (!result.success) {
      // Rollback
      setFollowedTopics(prev => {
        const next = new Set(prev)
        if (wasFollowing) {
          next.add(topicId)
        } else {
          next.delete(topicId)
        }
        return next
      })
    }

    return result
  }, [apiService, userId, followedTopics])

  return { isFollowing, toggleFollow, loading }
}

export default useTopics
