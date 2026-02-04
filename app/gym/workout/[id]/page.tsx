'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function WorkoutDetails() {
  const params = useParams()
  const router = useRouter()
  const [workout, setWorkout] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkout()
  }, [params.id])

  const fetchWorkout = async () => {
    try {
      const response = await fetch(`/api/gym?action=details&sessionId=${params.id}`)
      const data = await response.json()
      setWorkout(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching workout:', error)
      setLoading(false)
    }
  }

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000)
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} min`
  }

  const getTotalVolume = (exercise: any) => {
    if (!exercise.sets) return 0
    return exercise.sets.reduce((sum: number, set: any) => 
      sum + (parseFloat(set.weight) * parseInt(set.reps)), 0
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
        <p className="text-white text-xl">Loading workout...</p>
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-white">Workout not found</p>
          <Link href="/gym/history" className="text-blue-400 hover:underline">
            Back to history
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/gym/history"
            className="text-blue-400 hover:underline mb-4 inline-block"
          >
            ← Back to History
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            {new Date(workout.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h1>
          <div className="flex gap-6 text-gray-400">
            <p>Duration: {formatDuration(workout.start_time, workout.end_time)}</p>
            <p>Started: {new Date(workout.start_time).toLocaleTimeString()}</p>
            <p>Ended: {new Date(workout.end_time).toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-6">
          {workout.exercises && workout.exercises.map((exercise: any) => (
            <div key={exercise.id} className="bg-gray-800 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">{exercise.exercise_name}</h2>
                <div className="text-right">
                  <p className="text-blue-400 font-semibold">
                    {exercise.sets ? exercise.sets.length : 0} sets
                  </p>
                  <p className="text-gray-400 text-sm">
                    {getTotalVolume(exercise).toLocaleString()} lbs total
                  </p>
                </div>
              </div>

              {exercise.sets && exercise.sets.length > 0 ? (
                <div className="space-y-2">
                  {exercise.sets.map((set: any) => (
                    <div 
                      key={set.id}
                      className="bg-gray-700 p-4 rounded flex justify-between items-center"
                    >
                      <span className="text-gray-300">Set {set.set_number}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-white font-semibold text-lg">
                          {set.weight} lbs
                        </span>
                        <span className="text-gray-400">×</span>
                        <span className="text-white font-semibold text-lg">
                          {set.reps} reps
                        </span>
                        <span className="text-gray-500 text-sm ml-4">
                          ({(parseFloat(set.weight) * parseInt(set.reps)).toLocaleString()} lbs)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No sets logged</p>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        {workout.notes && (
          <div className="bg-gray-800 p-6 rounded-lg mt-6">
            <h3 className="text-lg font-semibold text-white mb-2">Notes</h3>
            <p className="text-gray-300">{workout.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}