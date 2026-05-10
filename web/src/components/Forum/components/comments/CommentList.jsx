import React from 'react'
import Comment from './Comment'
import CommentForm from './CommentForm'
import LoadingSpinner from '../common/LoadingSpinner'
import { colors, spacing } from '../../styles/theme'

function CommentList({
  comments,
  loading,
  onReply,
  onLike,
  isLiked,
  replyingTo,
  onSubmitReply,
  onCancelReply,
  currentUserId,
  isAuthenticated = false,
  isAdmin,
  onDeleteComment,
}) {
  if (loading) {
    return <LoadingSpinner text="loading comments..." />
  }

  if (!comments || comments.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        color: colors.text.muted,
        padding: spacing.lg,
      }}>
        no replies yet. be the first to respond.
      </div>
    )
  }

  const renderComment = (comment, depth = 0) => {
    return (
      <React.Fragment key={comment.id}>
        <Comment
          comment={comment}
          depth={depth}
          onReply={onReply}
          onLike={onLike}
          isLiked={isLiked?.(comment.id)}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onDelete={onDeleteComment}
        />
        
        {replyingTo === comment.id && (
          <div style={{ marginLeft: Math.min(depth + 1, 4) * 20, marginBottom: spacing.md }}>
            <CommentForm
              onSubmit={onSubmitReply}
              onCancel={onCancelReply}
              placeholder={`replying to No.${comment.id.toString().slice(-4).toUpperCase()}...`}
              compact
              isAuthenticated={isAuthenticated}
            />
          </div>
        )}
        
        {comment.replies && comment.replies.map(reply => 
          renderComment(reply, depth + 1)
        )}
      </React.Fragment>
    )
  }

  return (
    <div>
      {comments.map(comment => renderComment(comment))}
    </div>
  )
}

export default CommentList
