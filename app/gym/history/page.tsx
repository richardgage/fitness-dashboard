'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function GymHistory() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Gym Workout History</h1>
          <Link
            href="/gym"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            Start New Workout
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <p className="text-gray-400 mb-4">No workouts logged yet.</p>
            <Link
              href="/gym"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Log Your First Workout
            </Link>
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
      </div>
    </div>
  )
}