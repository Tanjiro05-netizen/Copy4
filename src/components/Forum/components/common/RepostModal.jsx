import React, { useState } from 'react'
import { colors, spacing, commonStyles } from '../../styles/theme'

function RepostModal({ thread, onRepost, onClose, isReposted }) {
  const [quoteContent, setQuoteContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRepost = async (withQuote = false) => {
    setIsSubmitting(true)
    try {
      await onRepost(thread.id, withQuote ? quoteContent : null)
      onClose()
    } catch (err) {
      console.error('Repost failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUnrepost = async () => {
    setIsSubmitting(true)
    try {
      await onRepost(thread.id, null, true) // true = unrepost
      onClose()
    } catch (err) {
      console.error('Unrepost failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        ...commonStyles.card,
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.lg,
          paddingBottom: spacing.sm,
          borderBottom: `1px solid ${colors.border.secondary}`,
        }}>
          <h3 style={{ margin: 0, fontWeight: 'normal' }}>
            {isReposted ? 'Remove Repost' : 'Repost Thread'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: colors.text.muted,
              cursor: 'pointer',
              fontSize: '18px',
              padding: spacing.xs,
            }}
          >
            ×
          </button>
        </div>

        {/* Thread Preview */}
        <div style={{
          backgroundColor: colors.bg.tertiary,
          padding: spacing.md,
          borderRadius: '4px',
          marginBottom: spacing.lg,
          borderLeft: `3px solid ${colors.accent.green}`,
        }}>
          <div style={{ fontSize: '12px', color: colors.text.muted, marginBottom: spacing.xs }}>
            @{thread.author?.username || 'Anonymous'}
          </div>
          <div style={{ fontWeight: 'bold', marginBottom: spacing.xs }}>
            {thread.title}
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: colors.text.secondary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}>
            {thread.content?.substring(0, 200)}
            {thread.content?.length > 200 && '...'}
          </div>
        </div>

        {isReposted ? (
          <div>
            <p style={{ color: colors.text.secondary, marginBottom: spacing.lg }}>
              You have already reposted this thread. Would you like to remove your repost?
            </p>
            <div style={{ display: 'flex', gap: spacing.md }}>
              <button
                onClick={handleUnrepost}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: spacing.sm,
                  backgroundColor: colors.accent.red,
                  color: colors.text.primary,
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1,
                }}
              >
                {isSubmitting ? 'Removing...' : 'Remove Repost'}
              </button>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: spacing.sm,
                  backgroundColor: 'transparent',
                  color: colors.text.secondary,
                  border: `1px solid ${colors.border.secondary}`,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Quote Input */}
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{ 
                display: 'block', 
                marginBottom: spacing.sm, 
                color: colors.text.secondary,
                fontSize: '13px',
              }}>
                Add a comment (optional):
              </label>
              <textarea
                value={quoteContent}
                onChange={(e) => setQuoteContent(e.target.value)}
                placeholder="Add your thoughts..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: spacing.sm,
                  backgroundColor: colors.bg.input,
                  border: `1px solid ${colors.border.primary}`,
                  color: colors.text.primary,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                }}
                maxLength={500}
              />
              <div style={{ 
                fontSize: '11px', 
                color: colors.text.muted, 
                textAlign: 'right',
                marginTop: spacing.xs,
              }}>
                {quoteContent.length}/500
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: spacing.md }}>
              <button
                onClick={() => handleRepost(false)}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: spacing.sm,
                  backgroundColor: colors.accent.green,
                  color: colors.bg.primary,
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1,
                  fontWeight: 'bold',
                }}
              >
                {isSubmitting ? 'Reposting...' : 'Repost'}
              </button>
              {quoteContent.trim() && (
                <button
                  onClick={() => handleRepost(true)}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: spacing.sm,
                    backgroundColor: colors.accent.sovietRed,
                    color: colors.text.primary,
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.5 : 1,
                    fontWeight: 'bold',
                  }}
                >
                  {isSubmitting ? 'Reposting...' : 'Quote Repost'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RepostModal
