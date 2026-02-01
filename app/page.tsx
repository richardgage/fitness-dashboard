import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900">
      <h1 className="text-5xl font-bold text-white mb-8">Fitness Training Dashboard</h1>
      <p className="text-xl text-gray-300 mb-12">Track your workouts and monitor your progress</p>
      
      <div className="flex gap-4">
        <Link 
          href="/dashboard"
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700"
        >
          View Dashboard
        </Link>
        <Link 
          href="/workouts"
          className="bg-green-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-green-700"
        >
          Log Workout
        </Link>
      </div>
    </main>
  );
}