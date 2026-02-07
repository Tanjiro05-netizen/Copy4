import React, { useState } from 'react'
import { BOARDS } from '../../constants'
import { colors, spacing, commonStyles } from '../../styles/theme'
import { validateThreadTitle, validateContent } from '../../utils/validators'

function ThreadForm({ onSubmit, onCancel, initialCategory, isAuthenticated = false }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_slug: initialCategory || 'theory',
    anonymous_name: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const titleValidation = validateThreadTitle(formData.title)
    if (!titleValidation.valid) {
      setError(titleValidation.error)
      return
    }
    
    const contentValidation = validateContent(formData.content)
    if (!contentValidation.valid) {
      setError(contentValidation.error)
      return
    }
    
    setLoading(true)
    try {
      await onSubmit?.(formData)
    } catch (err) {
      setError(err.message || 'failed to create thread')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      ...commonStyles.card,
      marginBottom: spacing.xl,
    }}>
      <h3 style={{
        marginBottom: spacing.lg,
        fontWeight: 'normal',
        color: colors.text.tertiary,
      }}>
        start a new thread
      </h3>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: spacing.md }}>
          <label style={{
            display: 'block',
            marginBottom: spacing.xs,
            color: colors.text.tertiary,
            fontSize: '12px',
          }}>
            board
          </label>
          <select
            name="category_slug"
            value={formData.category_slug}
            onChange={handleChange}
            style={{
              ...commonStyles.input,
              width: 'auto',
              minWidth: '200px',
            }}
            disabled={loading}
          >
            {BOARDS.map(board => (
              <option key={board.slug} value={board.name}>
                /{board.slug}/ - {board.fullName}
              </option>
            ))}
          </select>
        </div>

        {!isAuthenticated && (
          <div style={{ marginBottom: spacing.md }}>
            <label style={{
              display: 'block',
              marginBottom: spacing.xs,
              color: colors.text.tertiary,
              fontSize: '12px',
            }}>
              name (optional)
            </label>
            <input
              type="text"
              name="anonymous_name"
              value={formData.anonymous_name}
              onChange={handleChange}
              placeholder="Anonymous"
              style={{
                ...commonStyles.input,
                width: 'auto',
                minWidth: '200px',
              }}
              disabled={loading}
              maxLength={50}
            />
          </div>
        )}

        <div style={{ marginBottom: spacing.md }}>
          <label style={{
            display: 'block',
            marginBottom: spacing.xs,
            color: colors.text.tertiary,
            fontSize: '12px',
          }}>
            title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="enter thread title..."
            style={commonStyles.input}
            disabled={loading}
            maxLength={200}
          />
        </div>

        <div style={{ marginBottom: spacing.md }}>
          <label style={{
            display: 'block',
            marginBottom: spacing.xs,
            color: colors.text.tertiary,
            fontSize: '12px',
          }}>
            content
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="write your post..."
            rows={8}
            style={{
              ...commonStyles.input,
              resize: 'vertical',
              minHeight: '150px',
            }}
            disabled={loading}
          />
          <div style={{
            fontSize: '11px',
            color: colors.text.muted,
            marginTop: spacing.xs,
          }}>
            {formData.content.length} characters
          </div>
        </div>

        {error && (
          <div style={{
            color: colors.state.error,
            fontSize: '12px',
            marginBottom: spacing.md,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: spacing.sm }}>
          <button
            type="submit"
            style={commonStyles.buttonPrimary}
            disabled={loading}
          >
            {loading ? '[posting...]' : '[post thread]'}
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
      </form>
    </div>
  )
}

export default ThreadForm
