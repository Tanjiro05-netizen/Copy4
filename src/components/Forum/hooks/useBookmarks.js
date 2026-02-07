import { useState, useEffect, useCallback } from 'react'

export function useBookmarks(apiService, userId) {
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [loading, setLoading] = useState(false)

  const fetchBookmarkIds = useCallback(async () => {
    if (!userId) return
    
    setLoading(true)
    try {
      const ids = await apiService.getUserBookmarkIds(userId)
      setBookmarkedIds(new Set(ids))
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err)
    } finally {
      setLoading(false)
    }
  }, [apiService, userId])

  useEffect(() => {
    fetchBookmarkIds()
  }, [fetchBookmarkIds])

  const isBookmarked = useCallback((threadId) => {
    return bookmarkedIds.has(threadId)
  }, [bookmarkedIds])

  const toggleBookmark = useCallback(async (threadId) => {
    if (!userId) return { success: false, error: 'Not authenticated' }

    const currentlyBookmarked = bookmarkedIds.has(threadId)

    // Optimistic update
    setBookmarkedIds(prev => {
      const next = new Set(prev)
      if (currentlyBookmarked) {
        next.delete(threadId)
      } else {
        next.add(threadId)
      }
      return next
    })

    try {
      if (currentlyBookmarked) {
        await apiService.removeBookmark(threadId)
      } else {
        await apiService.addBookmark(threadId)
      }
      return { success: true, bookmarked: !currentlyBookmarked }
    } catch (err) {
      // Rollback on error
      setBookmarkedIds(prev => {
        const next = new Set(prev)
        if (currentlyBookmarked) {
          next.add(threadId)
        } else {
          next.delete(threadId)
        }
        return next
      })
      return { success: false, error: err }
    }
  }, [apiService, userId, bookmarkedIds])

  return {
    isBookmarked,
    toggleBookmark,
    refetch: fetchBookmarkIds,
    loading,
    bookmarkCount: bookmarkedIds.size,
  }
}

export default useBookmarks
