'use client'
import { useState, useEffect } from 'react'

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/feedback')
      const data = await response.json()
      setFeedback(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching feedback:', error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">User Feedback</h1>

        {loading ? (
          <p className="text-gray-400">Loading feedback...</p>
        ) : feedback.length === 0 ? (
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400">No feedback submitted yet.</p>
            <p className="text-gray-500 text-sm mt-2">
              Feedback will appear here when users submit it via the /feedback page.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-400 mb-4">Total submissions: {feedback.length}</p>
            {feedback.map((item: any) => (
              <div key={item.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-gray-400 text-sm">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                    {item.email && (
                      <p className="text-blue-400 text-sm mt-1">{item.email}</p>
                    )}
                  </div>
                  <span className="text-gray-500 text-sm">ID: {item.id}</span>
                </div>
                <p className="text-white whitespace-pre-wrap leading-relaxed">{item.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}