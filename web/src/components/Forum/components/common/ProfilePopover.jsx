import React, { useState, useEffect, useRef } from 'react'
import { colors, spacing, typography } from '../../styles/theme'
import { supabase } from '../../../../supabaseClient'
import Avatar from './Avatar'

function ProfilePopover({ userId, username, children, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const popoverRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const fetchProfile = async () => {
    if (!userId || profile) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, bio, ideology, avatar_url, banner_url, is_certified')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile for popover:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (disabled || !userId) return

    if (!isOpen) {
      fetchProfile()
      
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
        })
      }
    }
    
    setIsOpen(!isOpen)
  }

  return (
    <>
      <span
        ref={triggerRef}
        onClick={handleClick}
        style={{ cursor: disabled ? 'default' : 'pointer' }}
      >
        {children}
      </span>

      {isOpen && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            zIndex: 1000,
            width: '280px',
            backgroundColor: colors.bg.elevated,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Banner */}
          <div
            style={{
              height: '60px',
              backgroundColor: profile?.banner_url ? 'transparent' : colors.bg.hover,
              backgroundImage: profile?.banner_url ? `url(${profile.banner_url})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Avatar overlapping banner */}
          <div style={{ position: 'relative', padding: spacing.md }}>
            <div
              style={{
                position: 'absolute',
                top: '-30px',
                left: spacing.md,
              }}
            >
              <Avatar
                src={profile?.avatar_url}
                name={profile?.username || username}
                size={50}
                style={{
                  border: `3px solid ${colors.bg.elevated}`,
                }}
              />
            </div>

            {/* Content */}
            <div style={{ marginTop: '24px' }}>
              {loading ? (
                <div style={{ color: colors.text.tertiary, fontSize: typography.fontSize.sm }}>
                  loading...
                </div>
              ) : profile ? (
                <>
                  {/* Username */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                    <span style={{ 
                      color: colors.accent.green, 
                      fontWeight: 'bold',
                      fontSize: typography.fontSize.md,
                    }}>
                      {profile.username}
                    </span>
                    {profile.is_certified && (
                      <span style={{ color: colors.accent.green, fontSize: '12px' }}>✓</span>
                    )}
                  </div>

                  {/* Ideology */}
                  {profile.ideology && (
                    <div style={{ 
                      color: colors.text.tertiary, 
                      fontSize: typography.fontSize.xs,
                      marginTop: spacing.xs,
                    }}>
                      {profile.ideology}
                    </div>
                  )}

                  {/* Bio */}
                  {profile.bio && (
                    <div style={{ 
                      color: colors.text.secondary, 
                      fontSize: typography.fontSize.sm,
                      marginTop: spacing.sm,
                      lineHeight: typography.lineHeight.normal,
                      maxHeight: '60px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {profile.bio}
                    </div>
                  )}

                  {!profile.bio && !profile.ideology && (
                    <div style={{ 
                      color: colors.text.muted, 
                      fontSize: typography.fontSize.sm,
                      marginTop: spacing.sm,
                      fontStyle: 'italic',
                    }}>
                      no bio yet
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: colors.text.muted, fontSize: typography.fontSize.sm }}>
                  profile not found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProfilePopover
