import React from 'react'
import ThreadCard from './ThreadCard'
import Pagination from '../common/Pagination'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'
import { colors, spacing } from '../../styles/theme'

function ThreadList({
  threads,
  loading,
  error,
  pagination,
  onViewThread,
  onPageChange,
  onLikeThread,
  isThreadLiked,
  onRepost,
  isReposted,
  currentUserId,
  onRetry,
  isAdmin,
  onDeleteThread,
}) {
  if (loading) {
    return <LoadingSpinner text="loading threads..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />
  }

  if (!threads || threads.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        color: colors.text.muted,
        padding: spacing.xl,
        border: `1px solid ${colors.border.primary}`,
      }}>
        no threads yet. be the first to start a discussion.
      </div>
    )
  }

  return (
    <div>
      {threads.map(thread => (
        <ThreadCard
          key={thread.feedType === 'repost' ? `repost-${thread.repostId}` : thread.id}
          thread={thread}
          onView={onViewThread}
          onLike={onLikeThread}
          isLiked={isThreadLiked?.(thread.id)}
          onRepost={onRepost}
          isReposted={isReposted?.(thread.id)}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onDelete={onDeleteThread}
        />
      ))}

      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}

export default ThreadList
