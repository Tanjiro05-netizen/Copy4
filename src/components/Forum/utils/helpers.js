export function buildCommentTree(comments) {
  if (!comments || !comments.length) return []
  
  const map = {}
  const roots = []
  
  comments.forEach(comment => {
    map[comment.id] = { ...comment, replies: [] }
  })
  
  comments.forEach(comment => {
    if (comment.parent_id && map[comment.parent_id]) {
      map[comment.parent_id].replies.push(map[comment.id])
    } else {
      roots.push(map[comment.id])
    }
  })
  
  return roots
}

export function flattenCommentTree(tree) {
  const result = []
  
  function traverse(nodes) {
    nodes.forEach(node => {
      const { replies, ...comment } = node
      result.push(comment)
      if (replies && replies.length) {
        traverse(replies)
      }
    })
  }
  
  traverse(tree)
  return result
}

export function parseContent(content) {
  if (!content) return []
  
  const lines = content.split('\n')
  const segments = []
  
  lines.forEach((line, index) => {
    const quoteMatch = line.match(/^>>(\d+)/)
    if (quoteMatch) {
      segments.push({
        type: 'quote-link',
        postId: quoteMatch[1],
        text: line,
        key: index
      })
      return
    }
    
    if (line.startsWith('>') && !line.startsWith('>>')) {
      segments.push({
        type: 'greentext',
        text: line,
        key: index
      })
      return
    }
    
    segments.push({
      type: 'text',
      text: line,
      key: index
    })
  })
  
  return segments
}

export function canEdit(createdAt, windowMinutes = 30) {
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now - created
  const diffMinutes = diffMs / 1000 / 60
  
  return diffMinutes <= windowMinutes
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export function getInitials(name) {
  if (!name) return '?'
  const parts = name.split(/[\s_-]/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}
