'use client'
import { useState, useEffect } from 'react'

export default function CycleTracker() {
  const [cycles, setCycles] = useState([])
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
    fetchCycles()
  }, [])

  const fetchCycles = async () => {
    try {
      const response = await fetch('/api/cycles')
      const data = await response.json()
      setCycles(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching cycles:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const totalMinutes = (parseInt(formData.hours) || 0) * 60 + (parseInt(formData.minutes) || 0)
    
    const cycleData = {
      date: formData.date,
      distance_km: parseFloat(formData.distance_km),
      duration_minutes: totalMinutes,
      notes: formData.notes
    }

    try {
      if (editingId) {
        await fetch('/api/cycles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...cycleData })
        })
        setEditingId(null)
      } else {
        await fetch('/api/cycles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cycleData)
        })
      }

      setFormData({ date: '', distance_km: '', hours: '', minutes: '', notes: '' })
      fetchCycles()
    } catch (error) {
      console.error('Error saving cycle:', error)
    }
  }

  const handleEdit = (cycle: any) => {
    setEditingId(cycle.id)
    const hours = Math.floor(cycle.duration_minutes / 60)
    const minutes = cycle.duration_minutes % 60
    setFormData({
      date: cycle.date.split('T')[0],
      distance_km: cycle.distance_km.toString(),
      hours: hours.toString(),
      minutes: minutes.toString(),
      notes: cycle.notes || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this ride?')) return
    try {
      await fetch(`/api/cycles?id=${id}`, { method: 'DELETE' })
      fetchCycles()
    } catch (error) {
      console.error('Error deleting cycle:', error)
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

  const calculateAvgSpeed = (distance: number, minutes: number) => {
    const hours = minutes / 60
    return (distance / hours).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">🚴 Cycling Tracker</h1>

        {/* Log Ride Form */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            {editingId ? 'Edit Ride' : 'Log Ride'}
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
                placeholder="25.5"
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
                placeholder="Route, conditions, bike setup, etc."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                {editingId ? 'Update Ride' : 'Log Ride'}
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

        {/* Cycles List */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Ride History</h2>
          {loading ? (
            <p className="text-gray-400">Loading rides...</p>
          ) : cycles.length === 0 ? (
            <p className="text-gray-400">No rides logged yet. Add one above!</p>
          ) : (
            <div className="space-y-3">
              {cycles.map((cycle: any) => (
                <div key={cycle.id} className="bg-gray-700 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-300 text-sm">{new Date(cycle.date).toLocaleDateString()}</p>
                      <div className="mt-2 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-gray-400 text-xs">Distance</p>
                          <p className="text-white font-semibold">{cycle.distance_km} km</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Time</p>
                          <p className="text-white font-semibold">{formatDuration(cycle.duration_minutes)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Avg Speed</p>
                          <p className="text-white font-semibold">{calculateAvgSpeed(parseFloat(cycle.distance_km), cycle.duration_minutes)} km/h</p>
                        </div>
                      </div>
                      {cycle.notes && <p className="text-gray-400 text-sm mt-2">{cycle.notes}</p>}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(cycle)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cycle.id)}
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