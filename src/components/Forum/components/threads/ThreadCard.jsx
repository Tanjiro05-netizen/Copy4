import React from 'react'
import Avatar from '../common/Avatar'
import IdeologyTag from '../common/IdeologyTag'
import ProfilePopover from '../common/ProfilePopover'
import { colors, spacing } from '../../styles/theme'
import { formatDate, formatPostNumber, truncateText } from '../../utils/formatters'

function ThreadCard({ thread, onView, onLike, isLiked, onRepost, isReposted, currentUserId, isAdmin, onDelete }) {
  const {
    id,
    title,
    content,
    created_at,
    author,
    anonymous_name,
    category_slug,
    comment_count = 0,
    like_count = 0,
    repost_count = 0,
    is_pinned,
    is_locked,
    feedType,
    reposter,
    quoteContent,
  } = thread

  const sanitizedAnonName = anonymous_name && !['undefined', 'null'].includes(anonymous_name.toLowerCase().trim()) && anonymous_name.trim() ? anonymous_name.trim() : null
  const displayName = author?.username || sanitizedAnonName || 'Anonymous'

  return (
    <div style={{
      border: `1px solid ${colors.border.primary}`,
      marginBottom: spacing.md,
      backgroundColor: colors.bg.elevated,
    }}>
      {/* Repost indicator */}
      {feedType === 'repost' && reposter && (
        <div style={{
          padding: `${spacing.xs} ${spacing.md}`,
          backgroundColor: colors.bg.tertiary,
          borderBottom: `1px solid ${colors.border.secondary}`,
          fontSize: '12px',
          color: colors.text.muted,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.xs,
        }}>
          <span style={{ color: colors.accent.green }}>↻</span>
          <span>
            <ProfilePopover userId={reposter.id} username={reposter.username}>
              <span style={{ color: colors.accent.green, cursor: 'pointer' }}>
                @{reposter.username}
              </span>
            </ProfilePopover>
            {' '}reposted
          </span>
        </div>
      )}

      {/* Quote content if present */}
      {feedType === 'repost' && quoteContent && (
        <div style={{
          padding: spacing.md,
          backgroundColor: colors.bg.tertiary,
          borderBottom: `1px solid ${colors.border.secondary}`,
          fontStyle: 'italic',
          color: colors.text.secondary,
          fontSize: '13px',
        }}>
          "{quoteContent}"
        </div>
      )}

      <div style={{
        borderBottom: `1px solid ${colors.border.secondary}`,
        padding: `${spacing.sm} ${spacing.md}`,
        backgroundColor: colors.bg.primary,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
      }}>
        <ProfilePopover userId={author?.id} username={displayName} disabled={!author}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <Avatar
              src={author?.avatar_url}
              name={displayName}
              size={24}
            />
            <span style={{ color: author ? colors.accent.green : colors.text.tertiary }}>
              {displayName}
            </span>
          </div>
        </ProfilePopover>
        
        {author?.ideology && (
          <IdeologyTag ideology={author.ideology} />
        )}
        
        <span style={{ color: colors.text.muted, fontSize: '12px' }}>
          {formatDate(created_at)}
        </span>
        
        <span style={{ color: colors.text.faded, fontSize: '11px' }}>
          No.{formatPostNumber(id)}
        </span>
        
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
      
      <div style={{ padding: spacing.md }}>
        <h3 style={{
          marginBottom: spacing.sm,
          fontSize: '16px',
          fontWeight: 'normal',
        }}>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onView?.(thread) }}
            style={{ color: colors.text.primary, textDecoration: 'none' }}
          >
            {title}
          </a>
        </h3>
        
        <p style={{
          color: colors.text.secondary,
          fontSize: '14px',
          lineHeight: 1.5,
          marginBottom: spacing.md,
        }}>
          {truncateText(content, 300)}
        </p>
        
        <div style={{
          display: 'flex',
          gap: spacing.md,
          fontSize: '12px',
          color: colors.text.muted,
        }}>
          <span>/{category_slug}/</span>
          
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onView?.(thread) }}
            style={{ color: colors.accent.green }}
          >
            {comment_count} {comment_count === 1 ? 'reply' : 'replies'}
          </a>
          
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onLike?.(thread.id) }}
            style={{ 
              color: isLiked ? colors.accent.red : colors.text.muted,
            }}
          >
            ♥ {like_count}
          </a>
          
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onRepost?.(thread) }}
            style={{ 
              color: isReposted ? colors.accent.green : colors.text.muted,
            }}
          >
            ↻ {repost_count}
          </a>
          
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onView?.(thread) }}
            style={{ color: colors.accent.green }}
          >
            [view thread]
          </a>
          
          {isAdmin && (
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onDelete?.(thread.id) }}
              style={{ color: colors.accent.red, marginLeft: 'auto' }}
            >
              [delete]
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default ThreadCard
