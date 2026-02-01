'use client'
import { useState } from 'react'

export default function Feedback() {
  const [formData, setFormData] = useState({
    message: '',
    email: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({ message: '', email: '' })
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">Feature Requests & Feedback</h1>
        <p className="text-gray-300 mb-8">
          Have an idea for a new feature? Found a bug? Let me know!
        </p>

        {submitted && (
          <div className="bg-green-900/20 border border-green-500 p-4 rounded-lg mb-6">
            <p className="text-green-400">Thanks for your feedback! I'll review it soon.</p>
          </div>
        )}

        <div className="bg-gray-800 p-6 rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Your Feedback *</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full p-3 rounded bg-gray-700 text-white"
                rows={6}
                placeholder="Describe the feature you'd like to see, report a bug, or share any feedback..."
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Email (optional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 rounded bg-gray-700 text-white"
                placeholder="your@email.com (if you want a response)"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}