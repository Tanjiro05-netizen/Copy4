import React from 'react'
import Avatar from '../common/Avatar'
import IdeologyTag from '../common/IdeologyTag'
import ProfilePopover from '../common/ProfilePopover'
import { colors, spacing } from '../../styles/theme'
import { formatDate, formatPostNumber } from '../../utils/formatters'
import { parseContent } from '../../utils/helpers'

function Comment({
  comment,
  depth = 0,
  onReply,
  onLike,
  isLiked,
  currentUserId,
  isAdmin,
  onDelete,
}) {
  const {
    id,
    content,
    created_at,
    author,
    anonymous_name,
    like_count = 0,
    is_deleted,
  } = comment
  
  const displayName = author?.username || (anonymous_name && anonymous_name !== 'undefined' ? anonymous_name : null) || 'Anonymous'

  const contentSegments = parseContent(content)
  const maxDepth = 4
  const indentSize = Math.min(depth, maxDepth) * 20

  if (is_deleted) {
    return (
      <div
        id={`post-${formatPostNumber(id)}`}
        style={{
          marginLeft: indentSize,
          padding: spacing.md,
          marginBottom: spacing.sm,
          borderLeft: `2px solid ${colors.border.secondary}`,
          color: colors.text.muted,
          fontStyle: 'italic',
        }}
      >
        [deleted]
      </div>
    )
  }

  return (
    <div
      id={`post-${formatPostNumber(id)}`}
      style={{
        marginLeft: indentSize,
        marginBottom: spacing.md,
        borderLeft: depth > 0 ? `2px solid ${colors.border.secondary}` : 'none',
        paddingLeft: depth > 0 ? spacing.md : 0,
      }}
    >
      <div style={{
        border: `1px solid ${colors.border.primary}`,
        backgroundColor: colors.bg.elevated,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm,
          padding: `${spacing.xs} ${spacing.sm}`,
          borderBottom: `1px solid ${colors.border.secondary}`,
          backgroundColor: colors.bg.primary,
          fontSize: '12px',
        }}>
          <ProfilePopover userId={author?.id} username={displayName} disabled={!author}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <Avatar
                src={author?.avatar_url}
                name={displayName}
                size={20}
              />
              <span style={{ color: author ? colors.accent.green : colors.text.tertiary }}>
                {displayName}
              </span>
              {author?.ideology && (
                <IdeologyTag ideology={author.ideology} />
              )}
            </div>
          </ProfilePopover>
          
          <span style={{ color: colors.text.muted }}>
            {formatDate(created_at)}
          </span>
          
          <span style={{ color: colors.text.faded, fontSize: '11px' }}>
            No.{formatPostNumber(id)}
          </span>
        </div>

        <div style={{ padding: spacing.md }}>
          <div style={{ lineHeight: 1.5, marginBottom: spacing.sm }}>
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
            fontSize: '11px',
          }}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onLike?.(id) }}
              style={{ 
                color: isLiked ? colors.accent.red : colors.text.muted,
              }}
            >
              ♥ {like_count}
            </a>
            
            {onReply && (
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onReply?.(id) }}
                style={{ color: colors.accent.green }}
              >
                [reply]
              </a>
            )}
            
            {isAdmin && (
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onDelete?.(id) }}
                style={{ color: colors.accent.red, marginLeft: 'auto' }}
              >
                [delete]
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Comment
