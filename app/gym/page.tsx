import Link from 'next/link'

export default function GymLanding() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Gym Workout Tracker</h1>
        
        <div className="bg-gray-800 p-8 rounded-lg space-y-4">
          <Link 
            href="/gym/workout"
            className="block bg-green-600 text-white px-8 py-6 rounded-lg text-xl font-semibold hover:bg-green-700 text-center"
          >
            🏋️ Start New Workout
          </Link>
          
          <Link 
            href="/gym/history"
            className="block bg-blue-600 text-white px-8 py-6 rounded-lg text-xl font-semibold hover:bg-blue-700 text-center"
          >
            📊 Show Workout History
          </Link>
        </div>
      </div>
    </div>
  )
}