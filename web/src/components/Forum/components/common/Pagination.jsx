import React from 'react'
import { colors, spacing } from '../../styles/theme'

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    const showEllipsis = totalPages > 7
    
    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push('...')
      }
      
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...')
      }
      
      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <div style={{
      textAlign: 'center',
      marginTop: spacing.xl,
      color: colors.text.muted,
    }}>
      {getPageNumbers().map((page, index) => (
        <span key={index}>
          {page === '...' ? (
            <span style={{ margin: `0 ${spacing.xs}` }}>...</span>
          ) : (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (page !== currentPage) {
                  onPageChange?.(page)
                }
              }}
              style={{
                color: page === currentPage ? colors.text.primary : colors.accent.green,
                margin: `0 ${spacing.xs}`,
                textDecoration: page === currentPage ? 'none' : 'underline',
              }}
            >
              {page}
            </a>
          )}
        </span>
      ))}
    </div>
  )
}

export default Pagination
