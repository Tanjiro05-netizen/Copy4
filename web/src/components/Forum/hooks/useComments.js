import { useState, useEffect, useCallback } from 'react'
import { buildCommentTree } from '../utils/helpers'

export function useComments(apiService, threadId, userId = null) {
  const [comments, setComments] = useState([])
  const [flatComments, setFlatComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchComments = useCallback(async () => {
    if (!threadId) return
    
    try {
      setLoading(true)
      setError(null)
      
      const data = await apiService.getComments(threadId)
      setFlatComments(data || [])
      setComments(buildCommentTree(data || []))
    } catch (err) {
      setError(err.message)
      setComments([])
      setFlatComments([])
    } finally {
      setLoading(false)
    }
  }, [apiService, threadId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const createComment = useCallback(async (content, parentId = null, anonymousName = null) => {
    try {
      const newComment = await apiService.createComment({
        thread_id: threadId,
        content,
        parent_id: parentId,
        anonymous_name: anonymousName,
      }, userId)
      
      const updatedFlat = [...flatComments, newComment]
      setFlatComments(updatedFlat)
      setComments(buildCommentTree(updatedFlat))
      
      return { success: true, comment: newComment }
    } catch (err) {
      return { success: false, error: err }
    }
  }, [apiService, threadId, flatComments, userId])

  const updateComment = useCallback(async (commentId, content) => {
    try {
      const updatedComment = await apiService.updateComment(commentId, content)
      
      const updatedFlat = flatComments.map(c => 
        c.id === commentId ? updatedComment : c
      )
      setFlatComments(updatedFlat)
      setComments(buildCommentTree(updatedFlat))
      
      return { success: true, comment: updatedComment }
    } catch (err) {
      return { success: false, error: err }
    }
  }, [apiService, flatComments])

  const deleteComment = useCallback(async (commentId) => {
    try {
      await apiService.deleteComment(commentId)
      
      const updatedFlat = flatComments.map(c => 
        c.id === commentId ? { ...c, is_deleted: true, content: '[deleted]' } : c
      )
      setFlatComments(updatedFlat)
      setComments(buildCommentTree(updatedFlat))
      
      return { success: true }
    } catch (err) {
      return { success: false, error: err }
    }
  }, [apiService, flatComments])

  return {
    comments,
    flatComments,
    loading,
    error,
    refetch: fetchComments,
    createComment,
    updateComment,
    deleteComment,
    commentCount: flatComments.filter(c => !c.is_deleted).length,
  }
}

export default useComments
