import { supabase } from '../../../supabaseClient'

class ForumApiService {
  _attachCommentCounts(threads) {
    if (!threads) return []
    return threads.map(t => ({
      ...t,
      comment_count: Array.isArray(t.forum_comments) && t.forum_comments.length > 0
        ? t.forum_comments[0].count
        : (t.comment_count || 0),
      forum_comments: undefined,
    }))
  }

  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio, ideology, is_certified, role')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error fetching profile:', err)
      return null
    }
  }

  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error updating profile:', err)
      throw err
    }
  }

  async getThreads(options = {}) {
    const { category, page = 1, limit = 20, sortBy = 'recent' } = options
    
    try {
      let query = supabase
        .from('forum_threads')
        .select(`
          *,
          author:profiles(id, username, avatar_url, ideology, is_certified),
          forum_comments(count)
        `, { count: 'exact' })
      
      if (category) {
        query = query.eq('category_slug', category)
      }
      
      query = query.order('is_pinned', { ascending: false })
      
      if (sortBy === 'popular') {
        query = query.order('like_count', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }
      
      const start = (page - 1) * limit
      query = query.range(start, start + limit - 1)
      
      const { data, error, count } = await query
      
      if (error) throw error
      
      return {
        data: this._attachCommentCounts(data || []),
        page,
        totalPages: Math.ceil((count || 0) / limit),
        total: count || 0,
      }
    } catch (err) {
      console.error('Error fetching threads:', err)
      return { data: [], page: 1, totalPages: 0, total: 0 }
    }
  }

  async getThread(threadId) {
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .select(`
          *,
          author:profiles(id, username, avatar_url, ideology, is_certified),
          forum_comments(count)
        `)
        .eq('id', threadId)
        .single()
      
      if (error) throw error
      
      await supabase
        .from('forum_threads')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', threadId)
      
      const normalized = this._attachCommentCounts([data])[0]
      return normalized
    } catch (err) {
      console.error('Error fetching thread:', err)
      return null
    }
  }

  async createThread(threadData, userId = null) {
    try {
      const insertData = {
        title: threadData.title,
        content: threadData.content,
        category_slug: threadData.category_slug,
      }
      
      if (userId) {
        insertData.author_id = userId
      } else {
        const rawName = threadData.anonymous_name
        const cleanName = rawName && !['undefined', 'null'].includes(String(rawName).toLowerCase().trim()) && String(rawName).trim() ? String(rawName).trim() : 'Anonymous'
        insertData.anonymous_name = cleanName
      }
      
      const { data, error } = await supabase
        .from('forum_threads')
        .insert(insertData)
        .select(`
          *,
          author:profiles(id, username, avatar_url, ideology, is_certified)
        `)
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error creating thread:', err)
      throw err
    }
  }

  async updateThread(threadId, updates) {
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .update(updates)
        .eq('id', threadId)
        .select(`
          *,
          author:profiles(id, username, avatar_url, ideology, is_certified)
        `)
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error updating thread:', err)
      throw err
    }
  }

  async purgeSpamThreads(titlePatterns) {
    try {
      // Find threads matching any of the spam patterns
      let query = supabase
        .from('forum_threads')
        .select('id, title')

      const { data: threads, error: fetchError } = await query
      if (fetchError) throw fetchError

      const spamThreads = (threads || []).filter(t =>
        titlePatterns.some(pattern =>
          t.title.toLowerCase().includes(pattern.toLowerCase())
        )
      )

      if (spamThreads.length === 0) {
        console.log('No spam threads found matching patterns:', titlePatterns)
        return { deleted: 0 }
      }

      const spamIds = spamThreads.map(t => t.id)
      console.log(`Found ${spamIds.length} spam threads to delete:`, spamThreads.map(t => t.title))

      // Delete comments on spam threads first
      const { error: commentsError } = await supabase
        .from('forum_comments')
        .delete()
        .in('thread_id', spamIds)
      if (commentsError) console.warn('Error deleting spam comments:', commentsError)

      // Delete the spam threads
      const { error: threadsError } = await supabase
        .from('forum_threads')
        .delete()
        .in('id', spamIds)
      if (threadsError) throw threadsError

      console.log(`Successfully deleted ${spamIds.length} spam threads`)
      return { deleted: spamIds.length }
    } catch (err) {
      console.error('Error purging spam threads:', err)
      throw err
    }
  }

  async deleteThread(threadId) {
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .delete()
        .eq('id', threadId)
        .select()
      
      if (error) throw error
      
      if (!data || data.length === 0) {
        console.error('Delete returned 0 rows — RLS may be blocking the delete for thread:', threadId)
        throw new Error('Failed to delete thread. You may not have permission.')
      }
      
      console.log('Thread deleted successfully:', threadId, data)
    } catch (err) {
      console.error('Error deleting thread:', err)
      throw err
    }
  }

  async getUserThreads(userId) {
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .select(`
          *,
          author:profiles(id, username, avatar_url, ideology, is_certified),
          forum_comments(count)
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return this._attachCommentCounts(data || [])
    } catch (err) {
      console.error('Error fetching user threads:', err)
      return []
    }
  }

  async getComments(threadId) {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select(`
          *,
          author:profiles(id, username, avatar_url, ideology, is_certified)
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching comments:', err)
      return []
    }
  }

  async createComment(commentData, userId = null) {
    try {
      const insertData = {
        thread_id: commentData.thread_id,
        content: commentData.content,
        parent_id: commentData.parent_id || null,
      }
      
      if (userId) {
        insertData.author_id = userId
      } else {
        const rawName = commentData.anonymous_name
        const cleanName = rawName && !['undefined', 'null'].includes(String(rawName).toLowerCase().trim()) && String(rawName).trim() ? String(rawName).trim() : 'Anonymous'
        insertData.anonymous_name = cleanName
      }
      
      const { data, error } = await supabase
        .from('forum_comments')
        .insert(insertData)
        .select(`
          *,
          author:profiles(id, username, avatar_url, ideology, is_certified)
        `)
        .single()
      
      if (error) throw error
      
      return data
    } catch (err) {
      console.error('Error creating comment:', err)
      throw err
    }
  }

  async updateComment(commentId, content) {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .update({ content })
        .eq('id', commentId)
        .select(`
          *,
          author:profiles(id, username, avatar_url, ideology, is_certified)
        `)
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error updating comment:', err)
      throw err
    }
  }

  async deleteComment(commentId) {
    try {
      const { error } = await supabase
        .from('forum_comments')
        .delete()
        .eq('id', commentId)
      
      if (error) throw error
    } catch (err) {
      console.error('Error deleting comment:', err)
      throw err
    }
  }

  async getUserComments(userId) {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select(`
          *,
          author:profiles(id, username, avatar_url, ideology, is_certified),
          thread:forum_threads!forum_comments_thread_id_fkey(id, title)
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching user comments:', err)
      return []
    }
  }

  async like(targetType, targetId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { error } = await supabase
        .from('forum_likes')
        .insert({
          user_id: user.id,
          target_type: targetType,
          target_id: targetId,
        })
      
      if (error && error.code !== '23505') throw error
    } catch (err) {
      console.error('Error liking:', err)
      throw err
    }
  }

  async unlike(targetType, targetId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { error } = await supabase
        .from('forum_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
      
      if (error) throw error
    } catch (err) {
      console.error('Error unliking:', err)
      throw err
    }
  }

  async getUserLikes(userId) {
    try {
      const { data, error } = await supabase
        .from('forum_likes')
        .select('*')
        .eq('user_id', userId)
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching user likes:', err)
      return []
    }
  }

  async getUserLikedThreads(userId) {
    try {
      const { data: likes, error: likesError } = await supabase
        .from('forum_likes')
        .select('target_id')
        .eq('user_id', userId)
        .eq('target_type', 'thread')
      
      if (likesError) throw likesError
      
      if (!likes || likes.length === 0) return []
      
      const threadIds = likes.map(l => l.target_id)
      const { data, error } = await supabase
        .from('forum_threads')
        .select(`
          *,
          author:profiles(id, username, avatar_url, ideology, is_certified),
          forum_comments(count)
        `)
        .in('id', threadIds)
      
      if (error) throw error
      return this._attachCommentCounts(data || [])
    } catch (err) {
      console.error('Error fetching liked threads:', err)
      return []
    }
  }

  async getUserLikedComments(userId) {
    try {
      const { data: likes, error: likesError } = await supabase
        .from('forum_likes')
        .select('target_id')
        .eq('user_id', userId)
        .eq('target_type', 'comment')
      
      if (likesError) throw likesError
      
      if (!likes || likes.length === 0) return []
      
      const commentIds = likes.map(l => l.target_id)
      const { data, error } = await supabase
        .from('forum_comments')
        .select(`
          *,
          author:profiles(id, username, avatar_url, ideology, is_certified),
          thread:forum_threads!forum_comments_thread_id_fkey(id, title)
        `)
        .in('id', commentIds)
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching liked comments:', err)
      return []
    }
  }

  async isLiked(targetType, targetId, userId) {
    try {
      const { data, error } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .maybeSingle()
      
      if (error) throw error
      return !!data
    } catch (err) {
      console.error('Error checking like status:', err)
      return false
    }
  }

  // ============================================
  // BOOKMARKS
  // ============================================

  async getBookmarks(userId) {
    try {
      const { data, error } = await supabase
        .from('forum_bookmarks')
        .select(`
          id,
          created_at,
          thread:forum_threads(
            id,
            title,
            content,
            category_slug,
            created_at,
            comment_count,
            like_count,
            author:profiles(id, username, avatar_url)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching bookmarks:', err)
      return []
    }
  }

  async addBookmark(threadId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('forum_bookmarks')
        .insert({
          user_id: user.id,
          thread_id: threadId,
        })
        .select()
        .single()
      
      if (error && error.code !== '23505') throw error
      return { success: true, bookmark: data }
    } catch (err) {
      console.error('Error adding bookmark:', err)
      return { success: false, error: err }
    }
  }

  async removeBookmark(threadId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { error } = await supabase
        .from('forum_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('thread_id', threadId)
      
      if (error) throw error
      return { success: true }
    } catch (err) {
      console.error('Error removing bookmark:', err)
      return { success: false, error: err }
    }
  }

  async isBookmarked(threadId, userId) {
    try {
      const { data, error } = await supabase
        .from('forum_bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('thread_id', threadId)
        .maybeSingle()
      
      if (error) throw error
      return !!data
    } catch (err) {
      console.error('Error checking bookmark status:', err)
      return false
    }
  }

  async getUserBookmarkIds(userId) {
    try {
      const { data, error } = await supabase
        .from('forum_bookmarks')
        .select('thread_id')
        .eq('user_id', userId)
      
      if (error) throw error
      return (data || []).map(b => b.thread_id)
    } catch (err) {
      console.error('Error fetching bookmark IDs:', err)
      return []
    }
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================

  async getNotifications(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('forum_notifications')
        .select(`
          id,
          type,
          content_preview,
          is_read,
          created_at,
          thread_id,
          comment_id,
          source_user:profiles!forum_notifications_source_user_id_fkey(id, username, avatar_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching notifications:', err)
      return []
    }
  }

  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('forum_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
      
      if (error) throw error
      return count || 0
    } catch (err) {
      console.error('Error fetching unread count:', err)
      return 0
    }
  }

  async markNotificationRead(notificationId) {
    try {
      const { error } = await supabase
        .from('forum_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
      
      if (error) throw error
      return { success: true }
    } catch (err) {
      console.error('Error marking notification read:', err)
      return { success: false, error: err }
    }
  }

  async markAllNotificationsRead(userId) {
    try {
      const { error } = await supabase
        .from('forum_notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
      
      if (error) throw error
      return { success: true }
    } catch (err) {
      console.error('Error marking all notifications read:', err)
      return { success: false, error: err }
    }
  }

  async deleteNotification(notificationId) {
    try {
      const { error } = await supabase
        .from('forum_notifications')
        .delete()
        .eq('id', notificationId)
      
      if (error) throw error
      return { success: true }
    } catch (err) {
      console.error('Error deleting notification:', err)
      return { success: false, error: err }
    }
  }

  async clearAllNotifications(userId) {
    try {
      const { error } = await supabase
        .from('forum_notifications')
        .delete()
        .eq('user_id', userId)
      
      if (error) throw error
      return { success: true }
    } catch (err) {
      console.error('Error clearing notifications:', err)
      return { success: false, error: err }
    }
  }

  // ============================================
  // REPOSTS
  // ============================================

  async repost(threadId, quoteContent = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const insertData = {
        user_id: user.id,
        thread_id: threadId,
      }
      
      if (quoteContent && quoteContent.trim()) {
        insertData.quote_content = quoteContent.trim()
      }
      
      const { data, error } = await supabase
        .from('forum_reposts')
        .insert(insertData)
        .select()
        .single()
      
      if (error && error.code !== '23505') throw error
      return { success: true, repost: data }
    } catch (err) {
      console.error('Error creating repost:', err)
      return { success: false, error: err }
    }
  }

  async unrepost(threadId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { error } = await supabase
        .from('forum_reposts')
        .delete()
        .eq('user_id', user.id)
        .eq('thread_id', threadId)
      
      if (error) throw error
      return { success: true }
    } catch (err) {
      console.error('Error removing repost:', err)
      return { success: false, error: err }
    }
  }

  async getUserReposts(userId) {
    try {
      const { data, error } = await supabase
        .from('forum_reposts')
        .select(`
          id,
          quote_content,
          created_at,
          thread:forum_threads(
            id,
            title,
            content,
            category_slug,
            created_at,
            comment_count,
            like_count,
            repost_count,
            author:profiles(id, username, avatar_url, ideology, is_certified)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching user reposts:', err)
      return []
    }
  }

  async getUserRepostIds(userId) {
    try {
      const { data, error } = await supabase
        .from('forum_reposts')
        .select('thread_id')
        .eq('user_id', userId)
      
      if (error) throw error
      return (data || []).map(r => r.thread_id)
    } catch (err) {
      console.error('Error fetching repost IDs:', err)
      return []
    }
  }

  async isReposted(threadId, userId) {
    try {
      const { data, error } = await supabase
        .from('forum_reposts')
        .select('id')
        .eq('user_id', userId)
        .eq('thread_id', threadId)
        .maybeSingle()
      
      if (error) throw error
      return !!data
    } catch (err) {
      console.error('Error checking repost status:', err)
      return false
    }
  }

  async getFeedWithReposts(options = {}) {
    const { category, page = 1, limit = 20, sortBy = 'recent' } = options
    
    try {
      // Get threads
      let threadsQuery = supabase
        .from('forum_threads')
        .select(`
          *,
          author:profiles(id, username, avatar_url, ideology, is_certified),
          forum_comments(count)
        `, { count: 'exact' })
      
      if (category) {
        threadsQuery = threadsQuery.eq('category_slug', category)
      }
      
      threadsQuery = threadsQuery.order('is_pinned', { ascending: false })
      
      if (sortBy === 'popular') {
        threadsQuery = threadsQuery.order('like_count', { ascending: false })
      } else {
        threadsQuery = threadsQuery.order('created_at', { ascending: false })
      }
      
      const start = (page - 1) * limit
      threadsQuery = threadsQuery.range(start, start + limit - 1)
      
      const { data: threads, error: threadsError, count } = await threadsQuery
      
      if (threadsError) throw threadsError
      
      // Get recent reposts to mix into the feed
      const { data: reposts, error: repostsError } = await supabase
        .from('forum_reposts')
        .select(`
          id,
          user_id,
          quote_content,
          created_at,
          reposter:profiles!forum_reposts_user_id_fkey(id, username, avatar_url),
          thread:forum_threads(
            id,
            title,
            content,
            category_slug,
            created_at,
            comment_count,
            like_count,
            repost_count,
            author:profiles(id, username, avatar_url, ideology, is_certified)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (repostsError) throw repostsError
      
      // Mark threads as type 'thread'
      const normalizedThreads = this._attachCommentCounts(threads || [])
      const threadItems = normalizedThreads.map(t => ({
        ...t,
        feedType: 'thread',
        feedDate: t.created_at,
      }))
      
      // Mark reposts as type 'repost' and filter by category if needed
      const repostItems = (reposts || [])
        .filter(r => r.thread && (!category || r.thread.category_slug === category))
        .map(r => ({
          ...r.thread,
          feedType: 'repost',
          feedDate: r.created_at,
          repostId: r.id,
          reposter: r.reposter,
          quoteContent: r.quote_content,
        }))
      
      // Combine and sort by date
      const combined = [...threadItems, ...repostItems]
        .sort((a, b) => {
          // Pinned threads stay on top
          if (a.is_pinned && !b.is_pinned) return -1
          if (!a.is_pinned && b.is_pinned) return 1
          return new Date(b.feedDate) - new Date(a.feedDate)
        })
        .slice(0, limit)
      
      return {
        data: combined,
        page,
        totalPages: Math.ceil((count || 0) / limit),
        total: count || 0,
      }
    } catch (err) {
      console.error('Error fetching feed with reposts:', err)
      return { data: [], page: 1, totalPages: 0, total: 0 }
    }
  }
}

export const forumApiService = new ForumApiService()
export default ForumApiService
