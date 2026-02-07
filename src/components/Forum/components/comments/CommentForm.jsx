import React, { useState, useRef, useEffect } from 'react'
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
  const [honeypot, setHoneypot] = useState('')
  const mountTime = useRef(Date.now())

  useEffect(() => {
    mountTime.current = Date.now()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Anti-bot: honeypot check
    if (honeypot) return

    // Anti-bot: time-based check (must spend at least 3 seconds)
    const elapsed = Date.now() - mountTime.current
    if (elapsed < 3000) {
      setError('Please take a moment before posting.')
      return
    }

    // Anti-bot: rate limiting (10 second cooldown)
    const lastPost = localStorage.getItem('_lastCommentPost')
    if (lastPost && Date.now() - parseInt(lastPost, 10) < 10000) {
      const remaining = Math.ceil((10000 - (Date.now() - parseInt(lastPost, 10))) / 1000)
      setError(`Please wait ${remaining} seconds before posting another comment.`)
      return
    }
    
    const validation = validateContent(content, LIMITS.COMMENT_MIN)
    if (!validation.valid) {
      setError(validation.error)
      return
    }
    
    setLoading(true)
    try {
      await onSubmit?.(content, isAuthenticated ? null : (anonymousName || 'Anonymous'))
      localStorage.setItem('_lastCommentPost', Date.now().toString())
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
        {/* Anti-bot honeypot - hidden from humans */}
        <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
          <input
            type="text"
            name="website_url"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
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
