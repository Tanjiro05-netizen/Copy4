import React, { useState } from 'react'
import { colors, spacing, commonStyles } from '../../styles/theme'
import { validateContent } from '../../utils/validators'
import { LIMITS } from '../../constants'

function CommentForm({
  onSubmit,
  onCancel,
  placeholder = 'write a comment...',
  submitLabel = '[post]',
  compact = false,
  isAuthenticated = false,
}) {
  const [content, setContent] = useState('')
  const [anonymousName, setAnonymousName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validation = validateContent(content, LIMITS.COMMENT_MIN)
    if (!validation.valid) {
      setError(validation.error)
      return
    }
    
    setLoading(true)
    try {
      await onSubmit?.(content, isAuthenticated ? null : (anonymousName || 'Anonymous'))
      setContent('')
      setAnonymousName('')
      setError('')
    } catch (err) {
      setError(err.message || 'failed to post comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      ...commonStyles.card,
      padding: compact ? spacing.sm : spacing.lg,
      marginBottom: compact ? 0 : spacing.lg,
    }}>
      <form onSubmit={handleSubmit}>
        {!isAuthenticated && (
          <input
            type="text"
            value={anonymousName}
            onChange={(e) => setAnonymousName(e.target.value)}
            placeholder="Name (optional)"
            style={{
              ...commonStyles.input,
              marginBottom: spacing.sm,
              width: 'auto',
              minWidth: '150px',
            }}
            disabled={loading}
            maxLength={50}
          />
        )}
        <textarea
          value={content}
          onChange={(e) => { setContent(e.target.value); setError('') }}
          placeholder={placeholder}
          rows={compact ? 3 : 5}
          style={{
            ...commonStyles.input,
            resize: 'vertical',
            minHeight: compact ? '60px' : '100px',
            marginBottom: spacing.sm,
          }}
          disabled={loading}
          maxLength={LIMITS.COMMENT_MAX}
        />
        
        {error && (
          <div style={{
            color: colors.state.error,
            fontSize: '11px',
            marginBottom: spacing.sm,
          }}>
            {error}
          </div>
        )}
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '11px', color: colors.text.muted }}>
            {content.length}/{LIMITS.COMMENT_MAX}
          </span>
          
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <button
              type="submit"
              style={commonStyles.buttonPrimary}
              disabled={loading}
            >
              {loading ? '[posting...]' : submitLabel}
            </button>
            
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={commonStyles.buttonSecondary}
                disabled={loading}
              >
                [cancel]
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default CommentForm
