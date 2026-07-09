'use client'
import { useState, useEffect } from 'react'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageIsError, setMessageIsError] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(d => {
        setUser(d)
        setName(d.display_name || '')
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
      </div>
    </div>
  )
}