'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const formatDuration = (seconds: number) => {
  const s = Math.round(seconds || 0)
  const hours = Math.floor(s / 3600)
  const mins = Math.round((s % 3600) / 60)
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
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
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${time}`
}

export default function GymHistory() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/gym?action=feed&limit=200')
      .then(res => res.json())
      .then(d => {
        const mine = Array.isArray(d) ? d.filter((s: any) => s.is_mine) : []
        setHistory(mine)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-lg">Loading history...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-lg mx-auto">
        <div className="px-4 py-5 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white">Gym History</h1>
        </div>

        {history.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-400 mb-6">No workouts yet. Once you log a session, it'll show up here.</p>
            <Link
              href="/gym/active"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              Start a Workout
            </Link>
          </div>
        )}

        <div className="divide-y divide-gray-800">
          {history.map((session: any) => (
            <Link
              key={session.id}
              href={`/gym/workout/${session.id}`}
              className="block px-4 py-5 hover:bg-gray-800/50 transition-colors active:bg-gray-800"
            >
              {/* Timestamp */}
              <p className="text-gray-400 text-sm mb-2">
                {formatTimestamp(session.start_time)}
              </p>

              {/* Title */}
              <p className="text-white text-lg font-bold mb-3">Your Workout</p>

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
      </div>
    </div>
  )
}