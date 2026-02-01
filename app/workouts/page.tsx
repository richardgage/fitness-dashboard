'use client'
import { useState, useEffect } from 'react'

export default function Workouts() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    date: '',
    type: 'cycling',
    duration: '',
    distance: '',
    notes: ''
  })

  // Load workouts from database
  useEffect(() => {
    fetchWorkouts()
  }, [])

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts')
      const data = await response.json()
      setWorkouts(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching workouts:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          type: formData.type,
          duration: parseInt(formData.duration),
          distance: parseFloat(formData.distance) || 0,
          notes: formData.notes
        })
      })

      if (response.ok) {
        // Reset form
        setFormData({
          date: '',
          type: 'cycling',
          duration: '',
          distance: '',
          notes: ''
        })
        // Refresh workouts list
        fetchWorkouts()
      }
    } catch (error) {
      console.error('Error adding workout:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Training Log</h1>
        
        {/* Workout Form */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Log Workout</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Activity Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full p-2 rounded bg-gray-700 text-white"
              >
                <option value="cycling">Cycling</option>
                <option value="running">Running</option>
                <option value="swimming">Swimming</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Distance (km)</label>
              <input
                type="number"
                step="0.1"
                value={formData.distance}
                onChange={(e) => setFormData({...formData, distance: e.target.value})}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full p-2 rounded bg-gray-700 text-white"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Log Workout
            </button>
          </form>
        </div>

        {/* Workouts List */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Workouts</h2>
          {loading ? (
            <p className="text-gray-400">Loading workouts...</p>
          ) : workouts.length === 0 ? (
            <p className="text-gray-400">No workouts logged yet. Add one above!</p>
          ) : (
            <div className="space-y-3">
              {workouts.map((workout: any) => (
                <div key={workout.id} className="bg-gray-700 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-semibold capitalize">{workout.type}</h3>
                      <p className="text-gray-300 text-sm">{new Date(workout.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">{workout.duration} min</p>
                      {workout.distance > 0 && <p className="text-gray-300 text-sm">{workout.distance} km</p>}
                    </div>
                  </div>
                  {workout.notes && <p className="text-gray-400 text-sm mt-2">{workout.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}