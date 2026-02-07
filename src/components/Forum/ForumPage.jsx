import React, { useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import ThreadList from './components/threads/ThreadList'
import ThreadView from './components/threads/ThreadView'
import ThreadForm from './components/threads/ThreadForm'
import CatalogView from './components/threads/CatalogView'
import BookmarksPanel from './components/bookmarks/BookmarksPanel'
import NotificationsPanel from './components/notifications/NotificationsPanel'
import { useThreads, useThread } from './hooks/useThreads'
import { useComments } from './hooks/useComments'
import { useLikes } from './hooks/useLikes'
import { useBookmarks } from './hooks/useBookmarks'
import { useNotifications } from './hooks/useNotifications'
import { useReposts } from './hooks/useReposts'
import RepostModal from './components/common/RepostModal'
import { forumApiService } from './api'
import { colors, spacing, commonStyles } from './styles/theme'
import { BOARDS } from './constants'

function ForumPage() {
  const { user, profile, isAdmin } = useAuth()
  const isAuthenticated = !!user
  const userIsAdmin = isAdmin?.()
  
  const [currentView, setCurrentView] = useState('board')
  const [currentCategory, setCurrentCategory] = useState(null)
  const [selectedThreadId, setSelectedThreadId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showNewThreadForm, setShowNewThreadForm] = useState(false)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'catalog'
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [repostModalThread, setRepostModalThread] = useState(null)

  const {
    threads,
    loading: threadsLoading,
    error: threadsError,
    pagination,
    createThread,
    deleteThread,
    refetch: refetchThreads,
  } = useThreads(forumApiService, {
    category: currentCategory,
    page: currentPage,
  }, user?.id)

  const {
    thread: selectedThread,
  } = useThread(forumApiService, selectedThreadId)

  const {
    comments,
    loading: commentsLoading,
    createComment,
    deleteComment,
    refetch: refetchComments,
  } = useComments(forumApiService, selectedThreadId, user?.id)

  const {
    isLiked,
    toggleLike,
  } = useLikes(forumApiService, user?.id)

  const {
    isBookmarked,
    toggleBookmark,
  } = useBookmarks(forumApiService, user?.id)

  const {
    unreadCount,
    updateUnreadCount,
  } = useNotifications(forumApiService, user?.id)

  const {
    isReposted,
    repost,
    unrepost,
  } = useReposts(forumApiService, user?.id)

  const handleNavigateBoard = useCallback((category = null) => {
    setCurrentView('board')
    setCurrentCategory(category)
    setCurrentPage(1)
    setSelectedThreadId(null)
    setShowNewThreadForm(false)
  }, [])

  const handleViewThread = useCallback((thread) => {
    setSelectedThreadId(thread.id)
    setCurrentView('thread')
  }, [])

  const handleCreateThread = useCallback(async (threadData) => {
    const result = await createThread({
      ...threadData,
      category_slug: threadData.category_slug || currentCategory || 'theory',
    })
    if (result.success) {
      setShowNewThreadForm(false)
      handleViewThread(result.thread)
    } else {
      throw new Error(result.error?.message || 'Failed to create thread')
    }
  }, [createThread, currentCategory, handleViewThread])

  const handleCreateComment = useCallback(async (content, parentId = null, anonymousName = null) => {
    await createComment(content, parentId, anonymousName)
  }, [createComment])

  const handleLikeThread = useCallback(async (threadId) => {
    await toggleLike('thread', threadId)
    refetchThreads()
  }, [toggleLike, refetchThreads])

  const handleLikeComment = useCallback(async (commentId) => {
    await toggleLike('comment', commentId)
    refetchComments()
  }, [toggleLike, refetchComments])

  const handleOpenRepostModal = useCallback((thread) => {
    setRepostModalThread(thread)
  }, [])

  const handleDeleteThread = useCallback(async (threadId) => {
    if (!window.confirm('Are you sure you want to delete this thread? This cannot be undone.')) return
    const result = await deleteThread(threadId)
    if (result.success && currentView === 'thread') {
      handleNavigateBoard(currentCategory)
    }
  }, [deleteThread, currentView, handleNavigateBoard, currentCategory])

  const handleDeleteComment = useCallback(async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return
    await deleteComment(commentId)
  }, [deleteComment])

  const handleRepost = useCallback(async (threadId, quoteContent = null, isUnrepost = false) => {
    if (isUnrepost) {
      await unrepost(threadId)
    } else {
      await repost(threadId, quoteContent)
    }
    refetchThreads()
  }, [repost, unrepost, refetchThreads])

  const isThreadLiked = useCallback((threadId) => {
    return isLiked('thread', threadId)
  }, [isLiked])

  const isCommentLiked = useCallback((commentId) => {
    return isLiked('comment', commentId)
  }, [isLiked])

  const handlePurgeSpam = useCallback(async () => {
    if (!window.confirm('Purge all spam threads? This will delete threads matching known spam patterns.')) return
    try {
      const result = await forumApiService.purgeSpamThreads([
        'bots by 764',
        'fashfront',
        'patriotfront',
        'heil hitler',
        'kill nigger',
        'jewish nigger',
        'botted by 764',
      ])
      alert(`Purged ${result.deleted} spam threads.`)
      refetchThreads()
    } catch (err) {
      alert('Failed to purge spam: ' + err.message)
    }
  }, [refetchThreads])

  const currentBoard = BOARDS.find(b => b.name === currentCategory) || BOARDS[0]

  if (currentView === 'thread') {
    return (
      <div style={commonStyles.pageContainer}>
        <ThreadView
          thread={selectedThread}
          comments={comments}
          commentsLoading={commentsLoading}
          onBack={() => handleNavigateBoard(currentCategory)}
          onCreateComment={handleCreateComment}
          onLikeThread={handleLikeThread}
          onLikeComment={handleLikeComment}
          isThreadLiked={isThreadLiked(selectedThreadId)}
          isCommentLiked={isCommentLiked}
          onRepost={handleOpenRepostModal}
          isReposted={isReposted(selectedThreadId)}
          currentUserId={user?.id}
          isAuthenticated={isAuthenticated}
          isAdmin={userIsAdmin}
          onDeleteThread={handleDeleteThread}
          onDeleteComment={handleDeleteComment}
        />
        {repostModalThread && (
          <RepostModal
            thread={repostModalThread}
            onRepost={handleRepost}
            onClose={() => setRepostModalThread(null)}
            isReposted={isReposted(repostModalThread.id)}
          />
        )}
      </div>
    )
  }

  return (
    <div style={commonStyles.pageContainer}>
      <header style={{
        borderBottom: `1px solid ${colors.border.primary}`,
        paddingBottom: spacing.sm,
        marginBottom: spacing.lg,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg }}>
            <span 
              style={{ fontWeight: 'bold', cursor: 'pointer', color: colors.accent.sovietRed }}
              onClick={() => handleNavigateBoard(null)}
            >
              ☭ marxist.forum
            </span>
            
            <nav style={{ display: 'flex', gap: '4px' }}>
              <span style={{ color: colors.text.muted }}>[</span>
              {BOARDS.slice(0, 5).map((board, index) => (
                <React.Fragment key={board.slug}>
                  {index > 0 && <span style={{ color: colors.text.muted }}>/</span>}
                  <button
                    onClick={() => handleNavigateBoard(board.name)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: currentCategory === board.name ? colors.text.primary : colors.accent.green,
                      textDecoration: 'underline',
                      font: 'inherit',
                    }}
                  >
                    {board.slug}
                  </button>
                </React.Fragment>
              ))}
              <span style={{ color: colors.text.muted }}>]</span>
            </nav>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            fontSize: '13px',
          }}>
            {isAuthenticated && (
              <div style={{ display: 'flex', gap: spacing.sm }}>
                <button
                  onClick={() => setShowNotifications(true)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: colors.accent.green, font: 'inherit' }}
                >
                  [notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}]
                </button>
                <button
                  onClick={() => setShowBookmarks(true)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: colors.accent.green, font: 'inherit' }}
                >
                  [saved]
                </button>
              </div>
            )}
            {isAuthenticated ? (
              <>
                <span style={{ color: colors.text.muted }}>logged in as</span>
                <span style={{ color: colors.accent.green }}>
                  {profile?.username || user?.email || 'user'}
                </span>
              </>
            ) : (
              <span style={{ color: colors.text.muted }}>browsing as guest</span>
            )}
          </div>
        </div>
      </header>

      <div style={{ textAlign: 'center', marginBottom: spacing.xl }}>
        <div style={{
          width: '300px',
          height: '100px',
          margin: '0 auto 16px',
          backgroundColor: colors.bg.input,
          border: `1px solid ${colors.border.primary}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <span style={{ fontSize: '48px', color: colors.accent.sovietRed }}>☭</span>
          <span style={{
            position: 'absolute',
            bottom: '8px',
            right: '12px',
            fontSize: '11px',
            color: colors.text.muted,
          }}>
            marxist.forum
          </span>
        </div>
        
        <h1 style={{ fontSize: '28px', fontWeight: 'normal', marginBottom: spacing.sm }}>
          /{currentBoard.slug}/ - {currentBoard.fullName}
        </h1>
        
        <p style={{ color: colors.text.tertiary, fontStyle: 'italic', marginBottom: spacing.xs }}>
          {currentBoard.description}
        </p>
        
        <p style={{ color: colors.text.muted, fontSize: '12px' }}>
          workers of the world, unite
        </p>
      </div>

      <div style={{
        borderBottom: `1px solid ${colors.border.primary}`,
        paddingBottom: spacing.sm,
        marginBottom: spacing.lg,
        display: 'flex',
        gap: spacing.sm,
      }}>
        {currentCategory && (
          <button
            onClick={() => handleNavigateBoard(null)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: colors.accent.green, font: 'inherit' }}
          >
            [all boards]
          </button>
        )}
        
        <button
          onClick={() => setShowNewThreadForm(!showNewThreadForm)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: colors.accent.green, font: 'inherit' }}
        >
          {showNewThreadForm ? '[cancel]' : '[new thread]'}
        </button>
        
        <button
          onClick={() => refetchThreads()}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: colors.accent.green, font: 'inherit' }}
        >
          [refresh]
        </button>

        {userIsAdmin && (
          <button
            onClick={handlePurgeSpam}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: colors.state.error, font: 'inherit' }}
          >
            [purge spam]
          </button>
        )}
        
        <span style={{ marginLeft: 'auto', display: 'flex', gap: spacing.sm }}>
          <button
            onClick={() => setViewMode('list')}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: viewMode === 'list' ? colors.text.primary : colors.accent.green, font: 'inherit' }}
          >
            [list]
          </button>
          <button
            onClick={() => setViewMode('catalog')}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: viewMode === 'catalog' ? colors.text.primary : colors.accent.green, font: 'inherit' }}
          >
            [catalog]
          </button>
        </span>
      </div>

      {showNewThreadForm && (
        <ThreadForm
          onSubmit={handleCreateThread}
          onCancel={() => setShowNewThreadForm(false)}
          initialCategory={currentCategory}
          isAuthenticated={isAuthenticated}
        />
      )}

      {viewMode === 'catalog' ? (
        <CatalogView
          threads={threads}
          loading={threadsLoading}
          error={threadsError}
          onViewThread={handleViewThread}
          onBookmark={toggleBookmark}
          isBookmarked={isBookmarked}
          onRetry={refetchThreads}
        />
      ) : (
        <ThreadList
          threads={threads}
          loading={threadsLoading}
          error={threadsError}
          pagination={pagination}
          onViewThread={handleViewThread}
          onPageChange={setCurrentPage}
          onLikeThread={handleLikeThread}
          isThreadLiked={isThreadLiked}
          onRepost={handleOpenRepostModal}
          isReposted={isReposted}
          currentUserId={user?.id}
          onRetry={refetchThreads}
          isAdmin={userIsAdmin}
          onDeleteThread={handleDeleteThread}
        />
      )}

      {showBookmarks && (
        <BookmarksPanel
          apiService={forumApiService}
          userId={user?.id}
          onViewThread={handleViewThread}
          onClose={() => setShowBookmarks(false)}
        />
      )}

      {showNotifications && (
        <NotificationsPanel
          apiService={forumApiService}
          userId={user?.id}
          onViewThread={handleViewThread}
          onClose={() => setShowNotifications(false)}
          onUnreadCountChange={updateUnreadCount}
        />
      )}

      {repostModalThread && (
        <RepostModal
          thread={repostModalThread}
          onRepost={handleRepost}
          onClose={() => setRepostModalThread(null)}
          isReposted={isReposted(repostModalThread.id)}
        />
      )}

      <footer style={{
        marginTop: spacing.xxxl,
        paddingTop: spacing.lg,
        borderTop: `1px solid ${colors.border.secondary}`,
        textAlign: 'center',
        fontSize: '11px',
        color: colors.text.faded,
      }}>
        <p>marxist.forum - a forum for revolutionary theory and practice</p>
        <p style={{ marginTop: spacing.xs }}>
          <span style={{ color: colors.text.muted }}>all boards: </span>
          {BOARDS.map((board, index) => (
            <React.Fragment key={board.slug}>
              {index > 0 && <span> • </span>}
              <button
                onClick={() => handleNavigateBoard(board.name)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: colors.text.muted, font: 'inherit' }}
              >
                /{board.slug}/
              </button>
            </React.Fragment>
          ))}
        </p>
      </footer>
    </div>
  )
}

export default ForumPage
