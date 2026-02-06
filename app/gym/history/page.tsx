'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function GymHistory() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/gym')
      const data = await response.json()
      setSessions(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching sessions:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000)
    return `${minutes} min`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
        <p className="text-white text-xl">Loading workout history...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Gym</h1>

        <div className="space-y-4 mb-8">
          <Link
            href="/gym"
            className="block w-full bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 text-center text-lg"
          >
            Start New Workout
          </Link>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="block w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 text-center text-lg"
          >
            {showHistory ? 'Hide Workout History' : 'View Workout History'}
          </button>
        </div>

        {showHistory && (
          <>
            {sessions.length === 0 ? (
              <div className="bg-gray-800 p-8 rounded-lg text-center">
                <p className="text-gray-400">No workouts logged yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session: any) => (
                  <Link
                    key={session.id}
                    href={`/gym/workout/${session.id}`}
                    className="block bg-gray-800 p-6 rounded-lg hover:bg-gray-750 transition-colors border border-gray-700 hover:border-blue-500"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {new Date(session.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                          {formatDuration(session.start_time, session.end_time)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-400 font-semibold">
                          {session.exercise_count} {session.exercise_count === 1 ? 'exercise' : 'exercises'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {session.total_sets} total sets
                        </p>
                      </div>
                    </div>

                    {session.notes && (
                      <p className="text-gray-400 text-sm mt-3 italic">"{session.notes}"</p>
                    )}

                    <div className="mt-3 text-blue-400 text-sm">
                      Click to view details →
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}