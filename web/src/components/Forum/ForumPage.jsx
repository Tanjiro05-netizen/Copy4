import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useLocation, useNavigate } from '@/src/lib/router-shim'
import { FileText, Users, Wifi, MessageSquare, Heart, Repeat2, Pin, Lock, Send, BookOpen, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { forumApiService } from './api'
import { BOARDS, getBoardBySlug } from './constants'
import { formatRelativeTime, truncateText } from './utils/formatters'
import { parseContent } from './utils/helpers'
import { useThreads } from './hooks/useThreads'
import { useComments } from './hooks/useComments'
import { useLikes } from './hooks/useLikes'
import { useBookmarks } from './hooks/useBookmarks'
import { useReposts } from './hooks/useReposts'
import { useForumPresence } from './hooks/useForumPresence'
import { useRateLimit } from './hooks/useRateLimit'
import { useCorpusReferences } from './hooks/useCorpusReferences'
import { sanitizeInput } from './utils/sanitize'
import * as s from './ForumPage.css.ts'
import {
  ambientOrb,
  sectionEyebrow,
  actionButton,
  loadingState,
  loadingSpinner,
  emptyState,
  monoMeta,
} from '../../styles/obsidianTheme.css.ts'

// ── Route helpers ──────────────────────────────────────────

function parseForumPath(pathname) {
  const parts = pathname.replace(/^\/forum\/?/, '').split('/').filter(Boolean)
  if (parts[0] === 'thread' && parts[1]) return { view: 'thread', threadId: parts[1] }
  if (parts[0]) return { view: 'threads', boardSlug: parts[0] }
  return { view: 'boards' }
}

// ── Board Listing ──────────────────────────────────────────

function BoardListing({ stats, onlineCounts, onSelectBoard }) {
  return (
    <div className={s.boardList}>
      {BOARDS.map((board) => {
        const st = stats[board.slug] || { threadCount: 0, uniquePostersWeek: 0 }
        const online = onlineCounts[board.slug] || 0
        return (
          <div
            key={board.slug}
            className={s.boardRow}
            onClick={() => onSelectBoard(board.slug)}
          >
            <div className={s.boardInfo}>
              <div className={s.boardNameRow}>
                <h2 className={s.boardName}>{board.name}</h2>
                <span className={s.boardSlug}>/{board.slug}/</span>
              </div>
              <p className={s.boardDescription}>{board.description}</p>
            </div>
            <div className={s.boardMeta}>
              <span className={s.boardStat}>
                <FileText size={13} /> {st.threadCount}
              </span>
              <span className={s.boardStat}>
                <Users size={13} /> {st.uniquePostersWeek} this week
              </span>
              <span className={s.boardStat}>
                <Wifi size={13} /> {online} online
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Thread List (Obsidian-styled) ──────────────────────────

function ObsidianThreadCard({ thread, onClick }) {
  const displayName = thread.author?.username || 'Anonymous'
  return (
    <div className={s.threadCard} onClick={() => onClick(thread)}>
      <h3 className={s.threadTitle}>{thread.title}</h3>
      <p className={s.threadExcerpt}>{truncateText(thread.content, 240)}</p>
      <div className={s.threadMetaRow}>
        <span className={`${s.threadMetaStat} ${s.threadAuthor}`}>{displayName}</span>
        <span className={s.threadMetaStat}>{formatRelativeTime(thread.created_at)}</span>
        <span className={s.threadMetaStat}>
          <MessageSquare size={11} /> {thread.comment_count || 0}
        </span>
        <span className={s.threadMetaStat}>
          <Heart size={11} /> {thread.like_count || 0}
        </span>
        {thread.is_pinned && (
          <span className={`${s.threadMetaStat} ${s.threadPinned}`}>
            <Pin size={11} /> pinned
          </span>
        )}
        {thread.is_locked && (
          <span className={`${s.threadMetaStat} ${s.threadLocked}`}>
            <Lock size={11} /> locked
          </span>
        )}
      </div>
    </div>
  )
}

function ThreadListView({ boardSlug, onBack, onSelectThread, onCreateThread, user }) {
  const board = getBoardBySlug(boardSlug)
  const [page, setPage] = useState(1)
  const { threads, loading, error, pagination, refetch } = useThreads(
    forumApiService,
    { category: boardSlug, page, limit: 20, sortBy: 'created_at' },
    user?.id,
  )

  if (!board) {
    return (
      <div className={s.content}>
        <div className={s.breadcrumb}>
          <span className={s.breadcrumbLink} onClick={onBack}>boards</span>
          <span>/</span>
          <span>unknown</span>
        </div>
        <div className={emptyState}>Board not found.</div>
      </div>
    )
  }

  return (
    <div>
      <div className={s.breadcrumb}>
        <span className={s.breadcrumbLink} onClick={onBack}>boards</span>
        <span>{'>'}</span>
        <span>/{board.slug}/ — {board.name}</span>
      </div>

      <div className={s.threadListHeader}>
        <h2 className={s.threadListTitle}>{board.name}</h2>
        <div className={s.threadListActions}>
          {user && (
            <button
              className={actionButton({ tone: 'accent', size: 'sm' })}
              onClick={onCreateThread}
            >
              New Thread
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={loadingState}><div className={loadingSpinner} /></div>
      ) : error ? (
        <div className={emptyState}>
          Error: {error}
          <br />
          <button
            className={actionButton({ tone: 'ghost', size: 'sm' })}
            onClick={refetch}
            style={{ marginTop: 12 }}
          >
            Retry
          </button>
        </div>
      ) : threads.length === 0 ? (
        <div className={emptyState}>
          No threads yet. Be the first to start a discussion.
        </div>
      ) : (
        <>
          {threads.map((t) => (
            <ObsidianThreadCard key={t.id} thread={t} onClick={onSelectThread} />
          ))}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              {page > 1 && (
                <button
                  className={actionButton({ tone: 'ghost', size: 'sm' })}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </button>
              )}
              <span className={monoMeta} style={{ alignSelf: 'center' }}>
                {page} / {pagination.totalPages}
              </span>
              {page < pagination.totalPages && (
                <button
                  className={actionButton({ tone: 'ghost', size: 'sm' })}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Create Thread Form (Obsidian-styled) ───────────────────

function CreateThreadView({ boardSlug, onBack, onCreated, user }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedSlug, setSelectedSlug] = useState(boardSlug || BOARDS[0].slug)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const mountTime = useRef(Date.now())
  const { checkLimit } = useRateLimit()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (honeypot) return // bot trap
    if (Date.now() - mountTime.current < 3000) {
      setError('Please take a moment before posting.')
      return
    }
    const rl = checkLimit('thread')
    if (!rl.ok) {
      setError(`Too many posts. Try again in ${Math.ceil(rl.retryAfterMs / 1000)}s.`)
      return
    }
    if (title.trim().length < 3) { setError('Title must be at least 3 characters.'); return }
    if (content.trim().length < 10) { setError('Content must be at least 10 characters.'); return }

    setLoading(true)
    setError('')
    try {
      await forumApiService.createThread(
        { title: sanitizeInput(title.trim()), content: sanitizeInput(content.trim()), category_slug: selectedSlug },
        user.id,
      )
      onCreated()
    } catch (err) {
      setError(err.message || 'Failed to create thread.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className={s.breadcrumb}>
        <span className={s.breadcrumbLink} onClick={onBack}>/{boardSlug}/</span>
        <span>{'>'}</span>
        <span>new thread</span>
      </div>

      <form className={s.formPanel} onSubmit={handleSubmit}>
        <h2 className={s.formTitle}>Start a New Thread</h2>

        {/* Honeypot — hidden from real users, bots auto-fill it */}
        <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
          <label htmlFor="forum_website">Website</label>
          <input id="forum_website" name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </div>

        <div className={s.formField}>
          <label className={s.formLabel}>Board</label>
          <select
            className={s.formSelect}
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            disabled={loading}
          >
            {BOARDS.map((b) => (
              <option key={b.slug} value={b.slug}>
                /{b.slug}/ — {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className={s.formField}>
          <label className={s.formLabel}>Title</label>
          <input
            className={s.formInput}
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError('') }}
            placeholder="Thread title…"
            maxLength={200}
            disabled={loading}
          />
        </div>

        <div className={s.formField}>
          <label className={s.formLabel}>Content</label>
          <textarea
            className={s.formTextarea}
            value={content}
            onChange={(e) => { setContent(e.target.value); setError('') }}
            placeholder="Write your post…"
            disabled={loading}
          />
          <div className={s.charCount}>{content.length} characters</div>
        </div>

        {error && <div className={s.formError}>{error}</div>}

        <div className={s.formActions}>
          <button
            type="submit"
            className={actionButton({ tone: 'accent', size: 'md' })}
            disabled={loading}
          >
            {loading ? 'Posting…' : 'Post Thread'}
          </button>
          <button
            type="button"
            className={actionButton({ tone: 'ghost', size: 'md' })}
            onClick={onBack}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Theory References (Qdrant corpus cross-refs) ──────────

function TheoryReferences({ text }) {
  const { passages, loading } = useCorpusReferences(text)
  const [open, setOpen] = useState(false)

  if (loading || (!passages.length && !loading)) return null

  return (
    <div className={s.theoryRefsPanel}>
      <button className={s.theoryRefsToggle} onClick={() => setOpen((v) => !v)}>
        <BookOpen size={13} />
        Theory References ({passages.length})
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div className={s.theoryRefsList}>
          {passages.map((p, i) => (
            <div key={i} className={s.theoryRefCard}>
              <div className={s.theoryRefSource}>
                {p.author}, <em>{p.work}</em>{p.year ? ` (${p.year})` : ''}
                {p.section ? ` — ${p.section}` : ''}
              </div>
              <div className={s.theoryRefExcerpt}>{p.text}</div>
              {p.concept_tags?.length > 0 && (
                <div className={s.theoryRefTags}>
                  {p.concept_tags.map((tag) => (
                    <span key={tag} className={s.theoryRefTag}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Thread Detail ──────────────────────────────────────────

function ThreadDetailView({ threadId, onBack, user }) {
  const [thread, setThread] = useState(null)
  const [threadLoading, setThreadLoading] = useState(true)
  const [threadError, setThreadError] = useState(null)

  const {
    flatComments,
    loading: commentsLoading,
    createComment,
  } = useComments(forumApiService, threadId, user?.id)

  const { isLiked, toggleLike, fetchUserLikes } = useLikes(forumApiService, user?.id)
  const { isBookmarked, toggleBookmark } = useBookmarks(forumApiService, user?.id)
  const { isReposted, toggleRepost } = useReposts(forumApiService, user?.id)

  const [replyContent, setReplyContent] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [replyError, setReplyError] = useState('')
  const { checkLimit } = useRateLimit()

  useEffect(() => {
    let cancelled = false
    async function load() {
      setThreadLoading(true)
      setThreadError(null)
      try {
        const data = await forumApiService.getThread(threadId)
        if (!cancelled) setThread(data)
      } catch (err) {
        if (!cancelled) setThreadError(err.message)
      } finally {
        if (!cancelled) setThreadLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [threadId])

  useEffect(() => {
    if (user?.id) fetchUserLikes()
  }, [user?.id, fetchUserLikes])

  const handleLikeThread = useCallback(() => {
    if (!thread) return
    toggleLike('thread', thread.id)
  }, [thread, toggleLike])

  const handleRepost = useCallback(() => {
    if (!thread) return
    toggleRepost(thread.id)
  }, [thread, toggleRepost])

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyContent.trim()) return
    const rl = checkLimit('comment')
    if (!rl.ok) {
      setReplyError(`Too many replies. Try again in ${Math.ceil(rl.retryAfterMs / 1000)}s.`)
      return
    }
    setReplyLoading(true)
    setReplyError('')
    const result = await createComment(sanitizeInput(replyContent.trim()))
    if (result.success) {
      setReplyContent('')
    } else {
      setReplyError(result.error?.message || 'Failed to post reply.')
    }
    setReplyLoading(false)
  }

  if (threadLoading) {
    return <div className={loadingState}><div className={loadingSpinner} /></div>
  }
  if (threadError || !thread) {
    return <div className={emptyState}>{threadError || 'Thread not found.'}</div>
  }

  const displayName = thread.author?.username || 'Anonymous'
  const contentSegments = parseContent(thread.content)
  const threadLiked = isLiked('thread', thread.id)
  const threadReposted = isReposted(thread.id)
  const threadBookmarked = isBookmarked(thread.id)

  return (
    <div>
      <div className={s.breadcrumb}>
        <span className={s.breadcrumbLink} onClick={onBack}>
          /{thread.category_slug}/
        </span>
        <span>{'>'}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {truncateText(thread.title, 40)}
        </span>
      </div>

      <div className={s.threadDetailPanel}>
        <div className={s.threadDetailHeader}>
          <span className={s.threadAuthor}>{displayName}</span>
          <span className={monoMeta}>{formatRelativeTime(thread.created_at)}</span>
          <span className={monoMeta}>/{thread.category_slug}/</span>
          {thread.is_pinned && <span className={s.threadPinned}><Pin size={12} /> pinned</span>}
          {thread.is_locked && <span className={s.threadLocked}><Lock size={12} /> locked</span>}
        </div>

        <h1 className={s.threadDetailTitle}>{thread.title}</h1>

        <div className={s.threadDetailContent}>
          {contentSegments.map((seg) => {
            if (seg.type === 'greentext') {
              return <div key={seg.key} className="greentext">{seg.text}</div>
            }
            return <div key={seg.key}>{seg.text || <br />}</div>
          })}
        </div>

        <div className={s.threadDetailActions}>
          <button
            className={`${s.threadDetailAction} ${threadLiked ? s.threadDetailActionActive : ''}`}
            onClick={handleLikeThread}
          >
            <Heart size={13} /> {thread.like_count || 0}
          </button>
          <button
            className={`${s.threadDetailAction} ${threadReposted ? s.threadDetailActionActive : ''}`}
            onClick={handleRepost}
          >
            <Repeat2 size={13} /> {thread.repost_count || 0}
          </button>
          <button
            className={`${s.threadDetailAction} ${threadBookmarked ? s.threadDetailActionActive : ''}`}
            onClick={() => toggleBookmark(thread.id)}
          >
            {threadBookmarked ? 'saved' : 'save'}
          </button>
        </div>
      </div>

      {/* Corpus cross-references from Qdrant */}
      <TheoryReferences text={thread.content} />

      {/* Comments */}
      <div className={s.commentSection}>
        <h3 className={s.commentSectionTitle}>
          Replies ({flatComments?.length || 0})
        </h3>

        {commentsLoading ? (
          <div className={loadingState}><div className={loadingSpinner} /></div>
        ) : flatComments && flatComments.length > 0 ? (
          flatComments.map((c) => (
            <div
              key={c.id}
              className={`${s.commentCard} ${c.parent_id ? s.nestedComment : ''}`}
            >
              <div className={s.commentHeader}>
                <span className={s.commentAuthorName}>
                  {c.author?.username || 'Anonymous'}
                </span>
                <span>{formatRelativeTime(c.created_at)}</span>
              </div>
              <div className={s.commentBody}>
                {c.is_deleted ? '[deleted]' : c.content}
              </div>
              <div className={s.commentActions}>
                <button
                  className={s.threadDetailAction}
                  onClick={() => toggleLike('comment', c.id)}
                >
                  <Heart size={11} /> {c.like_count || 0}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={emptyState}>No replies yet.</div>
        )}

        {/* Reply form */}
        {user && !thread.is_locked && (
          <form className={s.commentFormWrap} onSubmit={handleReply}>
            <textarea
              className={s.commentFormTextarea}
              value={replyContent}
              onChange={(e) => { setReplyContent(e.target.value); setReplyError('') }}
              placeholder="Write a reply…"
              disabled={replyLoading}
            />
            {replyError && <div className={s.formError}>{replyError}</div>}
            <div className={s.commentFormActions}>
              <button
                type="submit"
                className={actionButton({ tone: 'accent', size: 'sm' })}
                disabled={replyLoading || !replyContent.trim()}
              >
                <Send size={13} /> {replyLoading ? 'Posting…' : 'Reply'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Main ForumPage ─────────────────────────────────────────

function ForumPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { view, boardSlug, threadId } = useMemo(
    () => parseForumPath(location.pathname),
    [location.pathname],
  )

  const [boardStats, setBoardStats] = useState({})
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { onlineCounts, totalOnline } = useForumPresence(user?.id, boardSlug || null)

  useEffect(() => {
    forumApiService.getBoardStats().then(setBoardStats).catch(() => {})
  }, [])

  const goToBoards = useCallback(() => {
    navigate('/forum')
    setShowCreateForm(false)
  }, [navigate])

  const goToBoard = useCallback(
    (slug) => {
      navigate(`/forum/${slug}`)
      setShowCreateForm(false)
    },
    [navigate],
  )

  const goToThread = useCallback(
    (thread) => navigate(`/forum/thread/${thread.id}`),
    [navigate],
  )

  const refreshBoardStats = useCallback(() => {
    forumApiService.getBoardStats().then(setBoardStats).catch(() => {})
  }, [])

  const handleCreated = useCallback(() => {
    setShowCreateForm(false)
    refreshBoardStats()
    navigate(`/forum/${boardSlug}`)
  }, [navigate, boardSlug, refreshBoardStats])

  return (
    <div className={s.page}>
      {/* Ambient orbs */}
      <div className={`${ambientOrb} ${s.heroOrbLeft}`} />
      <div className={`${ambientOrb} ${s.heroOrbRight}`} />

      {/* Hero */}
      <div className={s.hero}>
        <div className={s.heroInner}>
          <p className={sectionEyebrow}>Community</p>
          <h1 className={s.heroTitle}>Forum</h1>
          <p className={s.heroLead}>
            Discuss theory, share analysis, organise study groups, and connect with comrades.
          </p>
          {totalOnline > 0 && (
            <p className={s.heroLead} style={{ marginTop: 8 }}>
              <Wifi size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
              {totalOnline} {totalOnline === 1 ? 'comrade' : 'comrades'} online now
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={s.content}>
        {view === 'boards' && (
          <BoardListing stats={boardStats} onlineCounts={onlineCounts} onSelectBoard={goToBoard} />
        )}

        {view === 'threads' && !showCreateForm && (
          <ThreadListView
            boardSlug={boardSlug}
            onBack={goToBoards}
            onSelectThread={goToThread}
            onCreateThread={() => setShowCreateForm(true)}
            user={user}
          />
        )}

        {view === 'threads' && showCreateForm && (
          <CreateThreadView
            boardSlug={boardSlug}
            onBack={() => setShowCreateForm(false)}
            onCreated={handleCreated}
            user={user}
          />
        )}

        {view === 'thread' && (
          <ThreadDetailView
            threadId={threadId}
            onBack={() => {
              // Try to go back to the board the thread belongs to
              window.history.back()
            }}
            user={user}
          />
        )}
      </div>
    </div>
  )
}

export default ForumPage
