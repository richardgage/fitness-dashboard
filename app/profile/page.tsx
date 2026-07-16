'use client'
import { useState, useEffect } from 'react'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageIsError, setMessageIsError] = useState(false)

  const [restSeconds, setRestSeconds] = useState(90)
  const [restSaving, setRestSaving] = useState(false)
  const [restMessage, setRestMessage] = useState('')
  const [restMessageIsError, setRestMessageIsError] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(d => {
        setUser(d)
        setName(d.display_name || '')
        setRestSeconds(d.default_rest_seconds || 90)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setMessage('')
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name })
      })
      const result = await res.json()
      if (!res.ok) {
        setMessage(result.error || 'Something went wrong')
        setMessageIsError(true)
      } else {
        setUser(result)
        setMessage('Name updated')
        setMessageIsError(false)
      }
    } catch {
      setMessage('Something went wrong')
      setMessageIsError(true)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveRestTime = async () => {
    setRestMessage('')
    setRestSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultRestSeconds: restSeconds })
      })
      const result = await res.json()
      if (!res.ok) {
        setRestMessage(result.error || 'Something went wrong')
        setRestMessageIsError(true)
      } else {
        setUser(result)
        setRestMessage('Default rest time updated')
        setRestMessageIsError(false)
      }
    } catch {
      setRestMessage('Something went wrong')
      setRestMessageIsError(true)
    } finally {
      setRestSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
        <p className="text-white text-xl">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>

        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="mb-6">
            <label className="block text-gray-400 text-sm uppercase mb-2">Email</label>
            <p className="text-white">{user?.email}</p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 text-sm uppercase mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white"
              placeholder="Your name"
            />
          </div>

          {message && (
            <p className={`mb-4 text-sm ${messageIsError ? 'text-red-400' : 'text-green-400'}`}>
              {message}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mt-6">
          <h2 className="text-white text-lg font-semibold mb-1">Default Rest Time</h2>
          <p className="text-gray-400 text-sm mb-4">
            How long you rest between sets by default. You won't be asked this at the start of every workout anymore.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { seconds: 60, label: '60s' },
              { seconds: 90, label: '90s' },
              { seconds: 120, label: '2 min' },
              { seconds: 180, label: '3 min' },
              { seconds: 240, label: '4 min' },
              { seconds: 300, label: '5 min' },
            ].map(({ seconds, label }) => (
              <button
                key={seconds}
                onClick={() => setRestSeconds(seconds)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  restSeconds === seconds
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <label className="text-gray-300 text-sm">Or enter custom minutes:</label>
            <input
              type="number"
              min="0.5"
              max="60"
              step="0.5"
              defaultValue={(restSeconds / 60).toFixed(1)}
              onChange={(e) => {
                const minutes = parseFloat(e.target.value)
                if (!isNaN(minutes) && minutes > 0) {
                  setRestSeconds(Math.round(minutes * 60))
                }
              }}
              className="w-20 p-2 rounded bg-gray-700 text-white text-center"
            />
            <span className="text-gray-300 text-sm">min</span>
          </div>

          <p className="text-yellow-400 text-sm mb-4">
            Selected: {restSeconds < 60 ? `${restSeconds}s` : `${(restSeconds / 60).toFixed(1)} minutes`}
          </p>

          {restMessage && (
            <p className={`mb-4 text-sm ${restMessageIsError ? 'text-red-400' : 'text-green-400'}`}>
              {restMessage}
            </p>
          )}

          <button
            onClick={handleSaveRestTime}
            disabled={restSaving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600"
          >
            {restSaving ? 'Saving...' : 'Save Default Rest Time'}
          </button>
        </div>
      </div>
    </div>
  )
}