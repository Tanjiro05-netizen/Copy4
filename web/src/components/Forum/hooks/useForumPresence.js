import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../../supabaseClient'

/**
 * Tracks live online users on the forum using Supabase Realtime Presence.
 * Returns a map of boardSlug -> count of users currently viewing that board,
 * plus the total count of users on the forum.
 *
 * @param {string|null} userId  - current user's ID (null if anonymous)
 * @param {string|null} currentBoard - slug of the board the user is currently viewing (null = board listing)
 */
export function useForumPresence(userId, currentBoard = null) {
  const [onlineCounts, setOnlineCounts] = useState({})
  const [totalOnline, setTotalOnline] = useState(0)
  const channelRef = useRef(null)

  const recalculate = useCallback((presenceState) => {
    const counts = {}
    let total = 0

    Object.values(presenceState).forEach((presences) => {
      presences.forEach((p) => {
        total += 1
        const board = p.board
        if (board) {
          counts[board] = (counts[board] || 0) + 1
        }
      })
    })

    setOnlineCounts(counts)
    setTotalOnline(total)
  }, [])

  useEffect(() => {
    const channel = supabase.channel('forum-presence', {
      config: { presence: { key: userId || `anon-${Math.random().toString(36).slice(2)}` } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        recalculate(channel.presenceState())
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            board: currentBoard,
            online_at: new Date().toISOString(),
          })
        }
      })

    channelRef.current = channel

    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [userId, recalculate]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update the tracked board when the user navigates between boards
  useEffect(() => {
    const channel = channelRef.current
    if (!channel) return

    channel.track({
      user_id: userId,
      board: currentBoard,
      online_at: new Date().toISOString(),
    })
  }, [currentBoard, userId])

  return { onlineCounts, totalOnline }
}

export default useForumPresence
