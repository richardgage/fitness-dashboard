'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const formatDuration = (seconds: number) => {
  const s = Math.round(seconds || 0)
  const hours = Math.floor(s / 3600)
  const mins = Math.round((s % 3600) / 60)
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

const nameFromEmail = (email: string) => {
  if (!email) return '?'
  const namePart = email.split('@')[0]
  return namePart.charAt(0).toUpperCase() + namePart.slice(1)
}

const resolveName = (displayName: string | null | undefined, email: string) => {
  return displayName && displayName.trim() ? displayName : nameFromEmail(email)
}

const initialFromEmail = (email: string) => {
  return (email || '?').charAt(0).toUpperCase()
}

const initialFromName = (name: string) => {
  return (name || '?').charAt(0).toUpperCase()
}

const formatTimestamp = (startTime: string) => {
  const date = new Date(startTime)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  if (isToday) return `Today at ${time}`
  if (isYesterday) return `Yesterday at ${time}`
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${time}`
}

export default function Home() {
  const [feed, setFeed] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const PAGE_SIZE = 20

  const [showFriends, setShowFriends] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [friends, setFriends] = useState<any[]>([])
  const [friendEmail, setFriendEmail] = useState('')
  const [friendMessage, setFriendMessage] = useState('')
  const [friendMessageIsError, setFriendMessageIsError] = useState(false)

  const loadFriendsData = () => {
    fetch('/api/friends?action=pending')
      .then(res => res.json())
      .then(d => setPendingRequests(Array.isArray(d) ? d : []))
      .catch(() => {})

    fetch('/api/friends?action=friends')
      .then(res => res.json())
      .then(d => setFriends(Array.isArray(d) ? d : []))
      .catch(() => {})
  }

  const fetchFeedPage = async (before?: string) => {
    const url = before
      ? `/api/gym?action=feed&limit=${PAGE_SIZE}&before=${encodeURIComponent(before)}`
      : `/api/gym?action=feed&limit=${PAGE_SIZE}`
    const res = await fetch(url)
    const data = await res.json()
    return Array.isArray(data) ? data : []
  }

  useEffect(() => {
    fetchFeedPage()
      .then(data => {
        setFeed(data)
        setHasMore(data.length === PAGE_SIZE)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    loadFriendsData()
  }, [])

  const loadMore = async () => {
    if (loadingMore || !hasMore || feed.length === 0) return
    setLoadingMore(true)
    try {
      const lastItem = feed[feed.length - 1]
      const nextBatch = await fetchFeedPage(lastItem.start_time)
      setFeed(prev => [...prev, ...nextBatch])
      setHasMore(nextBatch.length === PAGE_SIZE)
    } catch {
      // leave hasMore as-is so the user can try scrolling again
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    if (!loadMoreRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '300px' }
    )
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [feed, hasMore, loadingMore])

  const sendFriendRequest = async () => {
    setFriendMessage('')
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sendRequest', email: friendEmail })
      })
      const result = await res.json()
      if (!res.ok) {
        setFriendMessage(result.error || 'Something went wrong')
        setFriendMessageIsError(true)
      } else {
        setFriendMessage('Friend request sent')
        setFriendMessageIsError(false)
        setFriendEmail('')
        loadFriendsData()
      }
    } catch {
      setFriendMessage('Something went wrong')
      setFriendMessageIsError(true)
    }
  }

  const handleRequest = async (requestId: number, decision: 'accept' | 'decline') => {
    try {
      await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: decision, requestId })
      })
      loadFriendsData()
    } catch {}
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-lg">Loading feed...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-lg mx-auto">
        <div className="px-4 py-5 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white mb-4">Feed</h1>
          <button
            onClick={() => setShowFriends(!showFriends)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700"
          >
            {showFriends ? 'Hide Friends' : 'Friends'}
          </button>
        </div>

        {showFriends && (
          <div className="px-4 py-5 border-b border-gray-800">
            {/* Pending requests */}
            {pendingRequests.length > 0 && (
              <div className="mb-6">
                <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">
                  Pending Requests ({pendingRequests.length})
                </h3>
                <div className="space-y-2">
                  {pendingRequests.map((req: any) => (
                    <div key={req.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                      <p className="text-white">{resolveName(req.sender_display_name, req.sender_email)}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequest(req.id, 'accept')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRequest(req.id, 'decline')}
                          className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invite a friend */}
            <div className="mb-6">
              <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Invite a Friend</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  placeholder="friend@email.com"
                  className="flex-1 p-3 rounded-lg bg-gray-800 text-white"
                />
                <button
                  onClick={sendFriendRequest}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
              {friendMessage && (
                <p className={`mt-2 text-sm ${friendMessageIsError ? 'text-red-400' : 'text-green-400'}`}>
                  {friendMessage}
                </p>
              )}
              {friendMessage && friendMessage.includes('No account') && (
                <p className="text-gray-400 text-sm mt-1">
                  Share this link with them to sign up:{' '}
                  <span className="text-blue-400">setsandreps.vercel.app/register</span>
                </p>
              )}
            </div>

            {/* Friends list — names only */}
            <div>
              <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">
                Friends {friends.length > 0 && `(${friends.length})`}
              </h3>
              {friends.length === 0 ? (
                <p className="text-gray-500 text-sm">No friends added yet. Invite someone above!</p>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend: any) => (
                    <div key={friend.id} className="bg-gray-800 p-3 rounded-lg flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {initialFromName(resolveName(friend.display_name, friend.email))}
                      </div>
                      <p className="text-white">{resolveName(friend.display_name, friend.email)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {feed.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-400 mb-6">No workouts yet. Once you or your friends log a session, it'll show up here.</p>
            <Link
              href="/gym/active"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              Start a Workout
            </Link>
          </div>
        )}

        <div className="divide-y divide-gray-800">
          {feed.map((session: any) => (
            <Link
              key={session.id}
              href={`/gym/workout/${session.id}`}
              className="block px-4 py-5 hover:bg-gray-800/50 transition-colors active:bg-gray-800"
            >
              {/* Header: avatar, name, timestamp */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {initialFromName(resolveName(session.display_name, session.email))}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold truncate">
                    {session.is_mine ? 'You' : resolveName(session.display_name, session.email)}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {formatTimestamp(session.start_time)}
                  </p>
                </div>
              </div>

              {/* Title */}
              <p className="text-white text-lg font-bold mb-3">
                {session.is_mine ? 'Your Workout' : `${resolveName(session.display_name, session.email)}'s Workout`}
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-0.5">Duration</p>
                  <p className="text-white font-bold text-base">{formatDuration(session.duration_seconds)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-0.5">Exercises</p>
                  <p className="text-white font-bold text-base">{session.exercise_count}</p>
                </div>
              </div>

              {/* Exercises with all sets */}
              {session.exercises && session.exercises.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {session.exercises.map((ex: any, i: number) => (
                    <div key={i} className="bg-blue-950 border border-blue-800 rounded-lg px-4 py-3 min-w-[140px]">
                      <p className="text-white text-xs uppercase mb-2 truncate">{ex.name}</p>
                      <div className="space-y-1">
                        {ex.sets?.map((set: any, si: number) => (
                          <p key={si} className="text-sm">
                            <span className="text-white font-bold">{set.weight} lbs</span>
                            <span className="text-gray-400"> × {set.reps}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Infinite scroll trigger */}
        {hasMore && feed.length > 0 && (
          <div ref={loadMoreRef} className="py-6 text-center">
            {loadingMore && <p className="text-gray-500 text-sm">Loading more...</p>}
          </div>
        )}
        {!hasMore && feed.length > 0 && (
          <p className="text-gray-600 text-sm text-center py-6">You're all caught up</p>
        )}
      </div>
    </div>
  )
}