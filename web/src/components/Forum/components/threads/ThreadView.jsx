import React, { useState } from 'react'
import Avatar from '../common/Avatar'
import IdeologyTag from '../common/IdeologyTag'
import ProfilePopover from '../common/ProfilePopover'
import CommentList from '../comments/CommentList'
import CommentForm from '../comments/CommentForm'
import LoadingSpinner from '../common/LoadingSpinner'
import { colors, spacing, commonStyles } from '../../styles/theme'
import { formatDate, formatPostNumber } from '../../utils/formatters'
import { parseContent } from '../../utils/helpers'

function ThreadView({
  thread,
  comments,
  commentsLoading,
  onBack,
  onCreateComment,
  onLikeThread,
  onLikeComment,
  isThreadLiked,
  isCommentLiked,
  onRepost,
  isReposted,
  currentUserId,
  isAuthenticated = false,
  isAdmin,
  onDeleteThread,
  onDeleteComment,
}) {
  const [replyingTo, setReplyingTo] = useState(null)

  if (!thread) {
    return <LoadingSpinner text="loading thread..." />
  }

  const {
    id,
    title,
    content,
    created_at,
    author,
    anonymous_name,
    category_slug,
    like_count = 0,
    repost_count = 0,
    is_pinned,
    is_locked,
  } = thread

  const sanitizedAnonName = anonymous_name && !['undefined', 'null'].includes(anonymous_name.toLowerCase().trim()) && anonymous_name.trim() ? anonymous_name.trim() : null
  const displayName = author?.username || sanitizedAnonName || 'Anonymous'
  const contentSegments = parseContent(content)

  const handleReply = (parentId = null) => {
    setReplyingTo(parentId)
  }

  const handleSubmitComment = async (commentContent, anonymousName = null) => {
    await onCreateComment?.(commentContent, replyingTo, anonymousName)
    setReplyingTo(null)
  }

  return (
    <div>
      <div style={{ marginBottom: spacing.lg }}>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onBack?.() }}
          style={{ color: colors.accent.green }}
        >
          [back to board]
        </a>
      </div>

      <div style={{
        ...commonStyles.card,
        marginBottom: spacing.xl,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
          paddingBottom: spacing.sm,
          borderBottom: `1px solid ${colors.border.secondary}`,
        }}>
          <ProfilePopover userId={author?.id} username={displayName} disabled={!author}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <Avatar
                src={author?.avatar_url}
                name={displayName}
                size={32}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                  <span style={{ color: author ? colors.accent.green : colors.text.tertiary, fontWeight: 'bold' }}>
                    {displayName}
                  </span>
                  {author?.ideology && (
                    <IdeologyTag ideology={author.ideology} />
                  )}
                </div>
              </div>
            </div>
          </ProfilePopover>
          
          <div style={{ fontSize: '11px', color: colors.text.muted }}>
            {formatDate(created_at)} • No.{formatPostNumber(id)} • /{category_slug}/
          </div>
          
          <div style={{ marginLeft: 'auto', display: 'flex', gap: spacing.sm }}>
            {is_pinned && (
              <span style={{ color: colors.accent.yellow, fontSize: '11px' }}>
                [pinned]
              </span>
            )}
            
            {is_locked && (
              <span style={{ color: colors.accent.red, fontSize: '11px' }}>
                [locked]
              </span>
            )}
          </div>
        </div>

        <h2 style={{
          fontSize: '20px',
          fontWeight: 'normal',
          marginBottom: spacing.lg,
        }}>
          {title}
        </h2>

        <div style={{
          lineHeight: 1.6,
          marginBottom: spacing.lg,
        }}>
          {contentSegments.map(segment => {
            if (segment.type === 'greentext') {
              return (
                <div key={segment.key} style={{ color: colors.accent.green }}>
                  {segment.text}
                </div>
              )
            }
            if (segment.type === 'quote-link') {
              return (
                <div key={segment.key}>
                  <a href={`#post-${segment.postId}`} style={{ color: colors.accent.red }}>
                    {segment.text}
                  </a>
                </div>
              )
            }
            return (
              <div key={segment.key}>
                {segment.text || <br />}
              </div>
            )
          })}
        </div>

        <div style={{
          display: 'flex',
          gap: spacing.md,
          fontSize: '12px',
          borderTop: `1px solid ${colors.border.secondary}`,
          paddingTop: spacing.md,
        }}>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onLikeThread?.(id) }}
            style={{ 
              color: isThreadLiked ? colors.accent.red : colors.text.muted,
            }}
          >
            ♥ {like_count} {isThreadLiked ? 'liked' : 'like'}
          </a>
          
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onRepost?.(thread) }}
            style={{ 
              color: isReposted ? colors.accent.green : colors.text.muted,
            }}
          >
            ↻ {repost_count} {isReposted ? 'reposted' : 'repost'}
          </a>
          
          {!is_locked && (
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); handleReply(null) }}
              style={{ color: colors.accent.green }}
            >
              [reply]
            </a>
          )}
          
          {isAdmin && (
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onDeleteThread?.(id) }}
              style={{ color: colors.accent.red, marginLeft: 'auto' }}
            >
              [delete thread]
            </a>
          )}
        </div>
      </div>

      {!is_locked && replyingTo === null && (
        <CommentForm
          onSubmit={handleSubmitComment}
          onCancel={() => setReplyingTo(null)}
          placeholder="write a reply..."
          isAuthenticated={isAuthenticated}
        />
      )}

      <div style={{ marginTop: spacing.xl }}>
        <h3 style={{
          marginBottom: spacing.lg,
          fontWeight: 'normal',
          color: colors.text.tertiary,
        }}>
          replies ({comments?.length || 0})
        </h3>

        <CommentList
          comments={comments}
          loading={commentsLoading}
          onReply={is_locked ? null : handleReply}
          onLike={onLikeComment}
          isLiked={isCommentLiked}
          replyingTo={replyingTo}
          onSubmitReply={handleSubmitComment}
          onCancelReply={() => setReplyingTo(null)}
          currentUserId={currentUserId}
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          onDeleteComment={onDeleteComment}
        />
      </div>
    </div>
  )
}

export default ThreadView
