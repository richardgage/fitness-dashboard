'use client'
import { useState, useEffect } from 'react'

const COMMON_EXERCISES = [
  'Bench Press',
  'Squat',
  'Deadlift',
  'Overhead Press',
  'Barbell Row',
  'Pull-ups',
  'Dips',
  'Leg Press',
  'Lat Pulldown',
  'Bicep Curl',
  'Tricep Extension',
  'Shoulder Press',
  'Leg Curl',
  'Leg Extension',
  'Calf Raise'
].sort()

export default function GymWorkout() {
  const [activeSession, setActiveSession] = useState<any>(null)
  const [currentExercise, setCurrentExercise] = useState<any>(null)
  const [selectedExerciseName, setSelectedExerciseName] = useState('')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [loading, setLoading] = useState(true)
  const [lastWorkout, setLastWorkout] = useState<any>(null)
  const [workoutNotes, setWorkoutNotes] = useState('')
  
  // Rest timer state
  const [restTimeSeconds, setRestTimeSeconds] = useState(90) // Default 90 seconds
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isResting, setIsResting] = useState(false)

  useEffect(() => {
    checkActiveSession()
  }, [])

  // Rest timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) {
      setIsResting(false)
      return
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          // Timer finished
          playSound()
          setIsResting(false)
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining])

  const playSound = () => {
    // Play a beep sound when timer finishes
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }
  }

  const startRestTimer = () => {
    setTimeRemaining(restTimeSeconds)
    setIsResting(true)
  }

  const skipRest = () => {
    setTimeRemaining(null)
    setIsResting(false)
  }

  const checkActiveSession = async () => {
    try {
      const response = await fetch('/api/gym?action=active')
      const data = await response.json()
      setActiveSession(data)
      setLoading(false)
    } catch (error) {
      console.error('Error checking active session:', error)
      setLoading(false)
    }
  }

  const startWorkout = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch('/api/gym', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'startSession', date: today })
      })
      const session = await response.json()
      setActiveSession({ ...session, exercises: [] })
    } catch (error) {
      console.error('Error starting workout:', error)
    }
  }

  const selectExercise = async (exerciseName: string) => {
    if (!exerciseName) return

    // Check if exercise already exists in current session
    const existingExercise = activeSession?.exercises?.find(
      (e: any) => e.exercise_name === exerciseName
    )

    if (existingExercise) {
      setCurrentExercise(existingExercise)
      setSelectedExerciseName(exerciseName)
    } else {
      // Add new exercise
      try {
        const order = (activeSession?.exercises?.length || 0) + 1
        const response = await fetch('/api/gym', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'addExercise',
            sessionId: activeSession.id,
            exerciseName,
            order
          })
        })
        const exercise = await response.json()
        const newExercise = { ...exercise, sets: [] }
        
        setActiveSession({
          ...activeSession,
          exercises: [...(activeSession.exercises || []), newExercise]
        })
        setCurrentExercise(newExercise)
        setSelectedExerciseName(exerciseName)
      } catch (error) {
        console.error('Error adding exercise:', error)
      }
    }

    // Fetch last workout for this exercise
    fetchLastWorkout(exerciseName)
  }

  const fetchLastWorkout = async (exerciseName: string) => {
    try {
      const response = await fetch(`/api/gym?action=lastWorkout&exerciseName=${encodeURIComponent(exerciseName)}`)
      const data = await response.json()
      setLastWorkout(data)
    } catch (error) {
      console.error('Error fetching last workout:', error)
      setLastWorkout(null)
    }
  }

  const addSet = async () => {
    if (!weight || !reps || !currentExercise) return

    try {
      const setNumber = (currentExercise.sets?.length || 0) + 1
      const response = await fetch('/api/gym', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addSet',
          exerciseId: currentExercise.id,
          setNumber,
          weight: parseFloat(weight),
          reps: parseInt(reps)
        })
      })
      const newSet = await response.json()

      // Update current exercise with new set
      const updatedExercise = {
        ...currentExercise,
        sets: [...(currentExercise.sets || []), newSet]
      }
      setCurrentExercise(updatedExercise)

      // Update active session
      const updatedExercises = activeSession.exercises.map((e: any) =>
        e.id === currentExercise.id ? updatedExercise : e
      )
      setActiveSession({ ...activeSession, exercises: updatedExercises })

      // Clear inputs
      setWeight('')
      setReps('')

      // Start rest timer
      startRestTimer()
    } catch (error) {
      console.error('Error adding set:', error)
    }
  }

  const endWorkout = async () => {
    if (!confirm('End this workout?')) return

    try {
      await fetch('/api/gym', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          notes: workoutNotes
        })
      })
      
      alert('Workout completed! 🎉')
      window.location.href = '/gym/history'
    } catch (error) {
      console.error('Error ending workout:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  if (!activeSession) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Gym Workout</h1>
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <p className="text-gray-300 mb-6">Ready to start your workout?</p>
            <button
              onClick={startWorkout}
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-green-700"
            >
              🏋️ Start Workout
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">🏋️ Workout in Progress</h1>
            <p className="text-gray-400 mt-2">
              Started: {new Date(activeSession.start_time).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={endWorkout}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700"
          >
            End Workout
          </button>
        </div>

        {/* Rest Timer */}
        {isResting && timeRemaining !== null && (
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-6 rounded-lg mb-6 text-center border-2 border-blue-500">
            <p className="text-blue-200 text-sm mb-2">Rest Period</p>
            <p className="text-white text-6xl font-bold mb-4">{formatTime(timeRemaining)}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={skipRest}
                className="bg-white text-blue-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100"
              >
                Skip Rest
              </button>
              <button
                onClick={() => setTimeRemaining(timeRemaining + 30)}
                className="bg-blue-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-900"
              >
                +30s
              </button>
            </div>
          </div>
        )}

        {/* Rest Timer Settings */}
        {!isResting && (
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <label className="block text-gray-300 text-sm mb-2">Default Rest Time (seconds)</label>
            <div className="flex gap-2">
              <button
                onClick={() => setRestTimeSeconds(60)}
                className={`px-4 py-2 rounded ${restTimeSeconds === 60 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                60s
              </button>
              <button
                onClick={() => setRestTimeSeconds(90)}
                className={`px-4 py-2 rounded ${restTimeSeconds === 90 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                90s
              </button>
              <button
                onClick={() => setRestTimeSeconds(120)}
                className={`px-4 py-2 rounded ${restTimeSeconds === 120 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                120s
              </button>
              <button
                onClick={() => setRestTimeSeconds(180)}
                className={`px-4 py-2 rounded ${restTimeSeconds === 180 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                180s
              </button>
            </div>
          </div>
        )}

        {/* Exercise Selection */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <label className="block text-white text-lg font-semibold mb-3">
            Select Exercise:
          </label>
          <select
            value={selectedExerciseName}
            onChange={(e) => selectExercise(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white text-lg"
          >
            <option value="">-- Choose Exercise --</option>
            {COMMON_EXERCISES.map(exercise => (
              <option key={exercise} value={exercise}>{exercise}</option>
            ))}
          </select>
        </div>

        {/* Current Exercise */}
        {currentExercise && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">{currentExercise.exercise_name}</h2>

            {/* Last Workout Info */}
            {lastWorkout && (
              <div className="bg-gray-700 p-4 rounded mb-4">
                <p className="text-gray-400 text-sm mb-2">
                  Last time ({new Date(lastWorkout.date).toLocaleDateString()}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {lastWorkout.sets.map((set: any, idx: number) => (
                    <span key={idx} className="text-gray-300 text-sm">
                      {set.weight} lbs × {set.reps}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Today's Sets */}
            {currentExercise.sets && currentExercise.sets.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Today's Sets:</p>
                <div className="space-y-2">
                  {currentExercise.sets.map((set: any) => (
                    <div key={set.id} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                      <span className="text-white">
                        Set {set.set_number}
                      </span>
                      <span className="text-green-400 font-semibold">
                        {set.weight} lbs × {set.reps} reps ✓
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Set Form */}
            <div className="border-t border-gray-700 pt-4">
              <p className="text-white font-semibold mb-3">Log Next Set:</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Weight (lbs)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full p-3 rounded bg-gray-700 text-white text-lg"
                    placeholder="135"
                    step="5"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Reps</label>
                  <input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="w-full p-3 rounded bg-gray-700 text-white text-lg"
                    placeholder="10"
                  />
                </div>
              </div>
              <button
                onClick={addSet}
                disabled={!weight || !reps}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Add Set
              </button>
            </div>
          </div>
        )}

        {/* Workout Summary */}
        {activeSession.exercises && activeSession.exercises.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">Today's Workout Summary</h3>
            <div className="space-y-4">
              {activeSession.exercises.map((exercise: any) => (
                <div key={exercise.id} className="border-b border-gray-700 pb-3">
                  <p className="text-white font-semibold mb-2">{exercise.exercise_name}</p>
                  {exercise.sets && exercise.sets.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {exercise.sets.map((set: any) => (
                        <span key={set.id} className="text-gray-400 text-sm">
                          {set.weight}×{set.reps}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No sets logged yet</p>
                  )}
                </div>
              ))}
            </div>

            {/* Workout Notes */}
            <div className="mt-6">
              <label className="block text-gray-400 text-sm mb-2">Workout Notes (optional)</label>
              <textarea
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white"
                rows={3}
                placeholder="How did the workout feel? Any observations..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}