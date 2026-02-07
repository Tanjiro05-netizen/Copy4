import { useState, useCallback } from 'react'

export function useLikes(apiService, userId) {
  const [likedItems, setLikedItems] = useState({})
  const [loading, setLoading] = useState(false)

  const isLiked = useCallback((targetType, targetId) => {
    const key = `${targetType}:${targetId}`
    return !!likedItems[key]
  }, [likedItems])

  const toggleLike = useCallback(async (targetType, targetId) => {
    if (!userId) return { success: false, error: { message: 'Must be logged in' } }
    
    const key = `${targetType}:${targetId}`
    const currentlyLiked = likedItems[key]
    
    setLikedItems(prev => ({
      ...prev,
      [key]: !currentlyLiked
    }))
    
    try {
      if (currentlyLiked) {
        await apiService.unlike(targetType, targetId)
      } else {
        await apiService.like(targetType, targetId)
      }
      return { success: true, liked: !currentlyLiked }
    } catch (err) {
      setLikedItems(prev => ({
        ...prev,
        [key]: currentlyLiked
      }))
      return { success: false, error: err }
    }
  }, [apiService, userId, likedItems])

  const fetchUserLikes = useCallback(async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      const likes = await apiService.getUserLikes(userId)
      
      const likeMap = {}
      likes.forEach(like => {
        likeMap[`${like.target_type}:${like.target_id}`] = true
      })
      setLikedItems(likeMap)
    } catch (err) {
      console.error('Failed to fetch likes:', err)
    } finally {
      setLoading(false)
    }
  }, [apiService, userId])

  const setLikeState = useCallback((targetType, targetId, liked) => {
    const key = `${targetType}:${targetId}`
    setLikedItems(prev => ({
      ...prev,
      [key]: liked
    }))
  }, [])

  return {
    isLiked,
    toggleLike,
    fetchUserLikes,
    setLikeState,
    loading,
  }
}

export default useLikes
