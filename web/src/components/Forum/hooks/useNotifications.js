import { useState, useEffect, useCallback } from 'react'

export function useNotifications(apiService, userId) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0)
      return
    }
    
    setLoading(true)
    try {
      const count = await apiService.getUnreadCount(userId)
      setUnreadCount(count)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    } finally {
      setLoading(false)
    }
  }, [apiService, userId])

  useEffect(() => {
    fetchUnreadCount()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  const updateUnreadCount = useCallback((count) => {
    setUnreadCount(count)
  }, [])

  return {
    unreadCount,
    loading,
    refetch: fetchUnreadCount,
    updateUnreadCount,
  }
}

export default useNotifications
