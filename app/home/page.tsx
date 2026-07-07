'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const formatVolume = (lbs: number) => {
  const val = parseFloat(String(lbs)) || 0
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M lbs`
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K lbs`
  return `${val.toLocaleString()} lbs`
}

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

const initialFromEmail = (email: string) => {
  return (email || '?').charAt(0).toUpperCase()
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

  useEffect(() => {
    fetch('/api/gym?action=feed')
      .then(res => res.json())
      .then(d => { setFeed(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

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
          <h1 className="text-2xl font-bold text-white">Feed</h1>
        </div>

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
                  {initialFromEmail(session.email)}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold truncate">
                    {session.is_mine ? 'You' : nameFromEmail(session.email)}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {formatTimestamp(session.start_time)}
                  </p>
                </div>
              </div>

              {/* Title */}
              <p className="text-white text-lg font-bold mb-3">
                {session.is_mine ? 'Your Workout' : `${nameFromEmail(session.email)}'s Workout`}
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-0.5">Duration</p>
                  <p className="text-white font-bold text-base">{formatDuration(session.duration_seconds)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-0.5">Volume</p>
                  <p className="text-white font-bold text-base">{formatVolume(parseFloat(session.total_volume))}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-0.5">Exercises</p>
                  <p className="text-white font-bold text-base">{session.exercise_count}</p>
                </div>
              </div>

              {/* Exercise list */}
              {session.exercise_names?.length > 0 && (
                <p className="text-gray-400 text-sm truncate">
                  {session.exercise_names.join(', ')}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}