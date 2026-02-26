'use client'
import { useState, useEffect } from 'react'

const COMMON_EXERCISES = [
  'Bench Press',
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
  'Calf Raise',
  'Bulgarian Split Squat',
  'Chest Fly',
  'Cable Row',
  'Hammer Curl',
  'Military Press',
  'Front Squat',
  'Back Squat',
  'Romanian Deadlift',
  'Hip Thrust',
  'Incline Bench Press',
  'Decline Bench Press',
  'Seated Row',
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
  const [customExercises, setCustomExercises] = useState<string[]>([])
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [newExerciseName, setNewExerciseName] = useState('')

  // Rest timer state
  const [restTimeSeconds, setRestTimeSeconds] = useState(90)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isResting, setIsResting] = useState(false)
  const [restTimeSelected, setRestTimeSelected] = useState(false)

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

  const fetchUserExercises = async () => {
    const response = await fetch('/api/gym?action=userExercises')
    const data = await response.json()
    setCustomExercises(data)
  }

  useEffect(() => {
    checkActiveSession()
    fetchUserExercises()
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

    const existingExercise = activeSession?.exercises?.find(
      (e: any) => e.exercise_name === exerciseName
    )

    if (existingExercise) {
      setCurrentExercise(existingExercise)
      setSelectedExerciseName(exerciseName)
    } else {
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
        const newExercise = { ...exercise, exercise_name: exerciseName,sets: [] }
        
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

    const updatedExercise = {
      ...currentExercise,
      sets: [...(currentExercise.sets || []), {
        ...newSet,
        weight: parseFloat(weight),
        reps: parseInt(reps),
        set_number: (currentExercise.sets?.length || 0) + 1
      }]
  }
      setCurrentExercise(updatedExercise)

      const updatedExercises = activeSession.exercises.map((e: any) =>
        e.exercise_name === currentExercise.exercise_name ? updatedExercise : e
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

const handleAddExercise = async () => {
  if (!newExerciseName.trim()) return
  
  await fetch('/api/gym', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'saveUserExercise', exerciseName: newExerciseName.trim() })
  })
  
  setCustomExercises([...customExercises, newExerciseName.trim()].sort())
  selectExercise(newExerciseName.trim())
  setNewExerciseName('')
  setShowAddExercise(false)
}

  const switchExercise = () => {
    setCurrentExercise(null)
    setSelectedExerciseName('')
    setWeight('')
    setReps('')
    setLastWorkout(null)
    skipRest() // Stop rest timer if running
  }

const endWorkout = async () => {
  if (!confirm('End this workout?')) return
  try {
    await fetch('/api/gym', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'endSession',
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
          <h1 className="text-4xl font-bold text-white text-center mb-8">Gym Workout</h1>
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <p className="text-gray-300 font-semibold mb-6">Click Below to Start Your Workout Timer</p>
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">🏋️ Workout in Progress</h1>
            <p className="text-gray-400 mt-2">
              Started: {new Date(activeSession.start_time).toLocaleTimeString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}
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

        {/* No Exercise Selected - Show Exercise Selector */}
        {!currentExercise && (<>
          {!restTimeSelected ? (
            <div className="bg-gray-800 p-8 rounded-lg text-center mb-6">
              <h2 className="text-white text-xl font-bold mb-2">Set Default Rest Time</h2>
              <p className="text-gray-400 text-sm mb-6">How long do you want to rest between sets?</p>
              <div className="flex flex-wrap gap-3 justify-center mb-6">{[
                { seconds: 60, label: '60s' },
                { seconds: 90, label: '90s' },
                { seconds: 120, label: '2 Minutes' },
                { seconds: 180, label: '3 Minutes' },
                { seconds: 240, label: '4 Minutes' },
                { seconds: 300, label: '5 Minutes' },
              ].map(({ seconds, label }) => (
                <button
                  key={seconds}
                  onClick={() => setRestTimeSeconds(seconds)}
                  className={`px-6 py-4 rounded-lg text-lg font-bold transition-colors ${
                    restTimeSeconds === seconds
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gray-700 rounded-lg p-4 flex items-center gap-3">
                <label className="text-gray-300 text-sm">Or enter custom minutes:</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  placeholder="e.g. 2.5"
                  step="0.5"
                  onChange={(e) => {
                    const minutes = parseFloat(e.target.value)
                    if (!isNaN(minutes) && minutes > 0) {
                      setRestTimeSeconds(Math.round(minutes * 60))
                    }
                  }}
                  className="w-24 p-2 rounded bg-gray-600 text-white text-center"
                />
                <span className="text-gray-300 text-sm">min</span>
              </div>
            </div>

            <p className="text-yellow-400 text-sm mb-4">
              Selected: {restTimeSeconds < 60 ? `${restTimeSeconds}s` : `${(restTimeSeconds / 60).toFixed(1)} minutes`}
            </p>

            <button
              onClick={() => setRestTimeSelected(true)}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              Continue to Exercise Selection →
            </button>
            </div>
          ) : (
            <>
              {/* Exercise Selection */}
              <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <label className="block text-white text-lg font-semibold mb-3">
                  Select Exercise:
                </label>
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedExerciseName}
                    onChange={(e) => selectExercise(e.target.value)}
                    className="flex-1 p-3 rounded bg-gray-700 text-white text-lg"
                  >
                    <option value="">-- Choose Exercise --</option>
                    {[...COMMON_EXERCISES, ...customExercises]
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .sort()
                      .map(exercise => (
                        <option key={exercise} value={exercise}>{exercise}</option>
                      ))}
                  </select>
                  <button
                    onClick={() => setShowAddExercise(!showAddExercise)}
                    className="bg-gray-700 text-white px-4 py-3 rounded hover:bg-gray-600 text-xl"
                  >
                    +
                  </button>
                </div>

                {showAddExercise && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newExerciseName}
                      onChange={(e) => setNewExerciseName(e.target.value)}
                      placeholder="Exercise name..."
                      className="flex-1 p-3 rounded bg-gray-700 text-white"
                    />
                    <button
                      onClick={handleAddExercise}
                      className="bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddExercise(false)}
                      className="bg-gray-700 text-white px-4 py-3 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

        {/* Exercise Selected - Show Logging Interface */}
        {currentExercise && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">{currentExercise.exercise_name}</h2>
              <button
                onClick={switchExercise}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Switch Exercise
              </button>
            </div>

            {/* Last Workout Info */}
            {lastWorkout && (
              <div className="bg-black border border-blue-500/40 p-4 rounded mb-2">
                <p className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
                  Last Session — {(() => {
                    const days = Math.floor((new Date().getTime() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24))
                    if (days === 0) return 'Today'
                    if (days === 1) return 'Yesterday'
                    return `${days} days ago`
                  })()}
                </p>
                <div className="flex flex-wrap gap-2">
                  {lastWorkout.sets && lastWorkout.sets.map((set: any, idx: number) => (
                    <div key={idx} className="bg-blue-800/40 border border-blue-600/30 px-3 py-2 rounded-lg text-center">
                      <p className="text-white font-bold text-lg">{set.weight} lbs</p>
                      <p className="text-white text-xs">{set.reps} reps</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today's Sets */}
            {currentExercise.sets && currentExercise.sets.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Today's Sets:</p>
                <div className="space-y-2">
                  {currentExercise.sets.map((set: any, idx: number) => (
                    <div key={set.id || idx} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                      <span className="text-white">Set {set.set_number}</span>
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
              <p className="text-white text-xl font-semibold mb-3">
                {currentExercise.sets && currentExercise.sets.length > 0 ? 'Enter' : 'Log your lift below'}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white text-m mb-2">Weight (lbs)</label>
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
                  <label className="block text-white text-m mb-2">Reps</label>
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
                className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {currentExercise.sets && currentExercise.sets.length > 0 ? 'Do Another Set' : 'Log First Set'}
              </button>
            </div>
          </div>
        )}

        {/* Workout Summary */}
        {activeSession.exercises && activeSession.exercises.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">Today's Workout Summary</h3>
            <div className="space-y-4">
              {activeSession.exercises.map((exercise: any, idx: number) => (
                <div key={exercise.id || idx} className="border-b border-gray-700 pb-3 last:border-0">
                  <p className="text-white font-semibold mb-2">{exercise.exercise_name}</p>
                  {exercise.sets && exercise.sets.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {exercise.sets.map((set: any, idx: number) => (
                        <span key={set.id || idx} className="text-gray-400 text-sm">
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
                placeholder="How did the workout feel?"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}