import { useState, useEffect, useCallback } from 'react'

export function useProfile(apiService, userId) {
  const [profile, setProfile] = useState(null)
  const [threads, setThreads] = useState([])
  const [comments, setComments] = useState([])
  const [likes, setLikes] = useState({ threads: [], comments: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getProfile(userId)
      setProfile(data)
    } catch (err) {
      setError(err.message)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [apiService, userId])

  const fetchUserThreads = useCallback(async () => {
    if (!userId) return
    
    try {
      const data = await apiService.getUserThreads(userId)
      setThreads(data || [])
    } catch (err) {
      console.error('Failed to fetch user threads:', err)
    }
  }, [apiService, userId])

  const fetchUserComments = useCallback(async () => {
    if (!userId) return
    
    try {
      const data = await apiService.getUserComments(userId)
      setComments(data || [])
    } catch (err) {
      console.error('Failed to fetch user comments:', err)
    }
  }, [apiService, userId])

  const fetchUserLikes = useCallback(async () => {
    if (!userId) return
    
    try {
      const [likedThreads, likedComments] = await Promise.all([
        apiService.getUserLikedThreads(userId),
        apiService.getUserLikedComments(userId),
      ])
      setLikes({
        threads: likedThreads || [],
        comments: likedComments || [],
      })
    } catch (err) {
      console.error('Failed to fetch user likes:', err)
    }
  }, [apiService, userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    threads,
    comments,
    likes,
    loading,
    error,
    fetchProfile,
    fetchUserThreads,
    fetchUserComments,
    fetchUserLikes,
  }
}

export default useProfile
