'use client'
import { useState, useEffect } from 'react'

export default function RunTracker() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    date: '',
    distance_km: '',
    hours: '',
    minutes: '',
    notes: ''
  })

  useEffect(() => {
    fetchRuns()
  }, [])

  const fetchRuns = async () => {
    try {
      const response = await fetch('/api/runs')
      const data = await response.json()
      setRuns(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching runs:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const totalMinutes = (parseInt(formData.hours) || 0) * 60 + (parseInt(formData.minutes) || 0)
    
    const runData = {
      date: formData.date,
      distance_km: parseFloat(formData.distance_km),
      duration_minutes: totalMinutes,
      notes: formData.notes
    }

    try {
      if (editingId) {
        await fetch('/api/runs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...runData })
        })
        setEditingId(null)
      } else {
        await fetch('/api/runs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(runData)
        })
      }

      setFormData({ date: '', distance_km: '', hours: '', minutes: '', notes: '' })
      fetchRuns()
    } catch (error) {
      console.error('Error saving run:', error)
    }
  }

  const handleEdit = (run: any) => {
    setEditingId(run.id)
    const hours = Math.floor(run.duration_minutes / 60)
    const minutes = run.duration_minutes % 60
    setFormData({
      date: run.date.split('T')[0],
      distance_km: run.distance_km.toString(),
      hours: hours.toString(),
      minutes: minutes.toString(),
      notes: run.notes || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this run?')) return
    try {
      await fetch(`/api/runs?id=${id}`, { method: 'DELETE' })
      fetchRuns()
    } catch (error) {
      console.error('Error deleting run:', error)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ date: '', distance_km: '', hours: '', minutes: '', notes: '' })
  }

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`
  }

  const calculatePace = (distance: number, minutes: number) => {
    const paceMinutes = minutes / distance
    const paceMins = Math.floor(paceMinutes)
    const paceSecs = Math.round((paceMinutes - paceMins) * 60)
    return `${paceMins}:${paceSecs.toString().padStart(2, '0')}/km`
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">🏃 Running Tracker</h1>

        {/* Log Run Form */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            {editingId ? 'Edit Run' : 'Log Run'}
          </h2>
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
              <label className="block text-gray-300 mb-2">Distance (km)</label>
              <input
                type="number"
                step="0.1"
                value={formData.distance_km}
                onChange={(e) => setFormData({...formData, distance_km: e.target.value})}
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="5.2"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Duration</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    value={formData.hours}
                    onChange={(e) => setFormData({...formData, hours: e.target.value})}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Hours"
                    min="0"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={formData.minutes}
                    onChange={(e) => setFormData({...formData, minutes: e.target.value})}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Minutes"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full p-2 rounded bg-gray-700 text-white"
                rows={3}
                placeholder="How did it feel? Route, weather, etc."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                {editingId ? 'Update Run' : 'Log Run'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Runs List */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Running History</h2>
          {loading ? (
            <p className="text-gray-400">Loading runs...</p>
          ) : runs.length === 0 ? (
            <p className="text-gray-400">No runs logged yet. Add one above!</p>
          ) : (
            <div className="space-y-3">
              {runs.map((run: any) => (
                <div key={run.id} className="bg-gray-700 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-300 text-sm">{new Date(run.date).toLocaleDateString()}</p>
                      <div className="mt-2 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-gray-400 text-xs">Distance</p>
                          <p className="text-white font-semibold">{run.distance_km} km</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Time</p>
                          <p className="text-white font-semibold">{formatDuration(run.duration_minutes)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Pace</p>
                          <p className="text-white font-semibold">{calculatePace(parseFloat(run.distance_km), run.duration_minutes)}</p>
                        </div>
                      </div>
                      {run.notes && <p className="text-gray-400 text-sm mt-2">{run.notes}</p>}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(run)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(run.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}