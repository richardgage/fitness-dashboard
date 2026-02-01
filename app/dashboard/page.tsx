'use client'
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function Dashboard() {
  const [workouts, setWorkouts] = useState([])
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalDuration: 0,
    totalDistance: 0,
    thisWeek: 0,
    thisMonth: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkouts()
  }, [])

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts')
      const data = await response.json()
      setWorkouts(data)
      calculateStats(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching workouts:', error)
      setLoading(false)
    }
  }

  const calculateStats = (workouts: any[]) => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0)
    const totalDistance = workouts.reduce((sum, w) => sum + parseFloat(w.distance || 0), 0)
    
    const thisWeek = workouts.filter(w => new Date(w.date) >= oneWeekAgo).length
    const thisMonth = workouts.filter(w => new Date(w.date) >= oneMonthAgo).length

    setStats({
      totalWorkouts: workouts.length,
      totalDuration,
      totalDistance: Math.round(totalDistance * 10) / 10,
      thisWeek,
      thisMonth
    })
  }

  // Prepare data for charts
  const getWorkoutsByType = () => {
    const byType: { [key: string]: number } = {}
    workouts.forEach((w: any) => {
      byType[w.type] = (byType[w.type] || 0) + 1
    })
    return Object.entries(byType).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count
    }))
  }

  // Last 7 days activity
  const getLast7Days = () => {
    const last7Days = []
    const now = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayWorkouts = workouts.filter((w: any) => w.date.split('T')[0] === dateStr)
      const totalMinutes = dayWorkouts.reduce((sum, w: any) => sum + w.duration, 0)
      
      last7Days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: totalMinutes
      })
    }
    
    return last7Days
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
        <p className="text-white text-xl">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Training Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm uppercase mb-2">Total Workouts</p>
            <p className="text-white text-3xl font-bold">{stats.totalWorkouts}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm uppercase mb-2">Total Time</p>
            <p className="text-white text-3xl font-bold">
              {Math.floor(stats.totalDuration / 60)}h {stats.totalDuration % 60}m
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm uppercase mb-2">Total Distance</p>
            <p className="text-white text-3xl font-bold">{stats.totalDistance} km</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm uppercase mb-2">This Week</p>
            <p className="text-white text-3xl font-bold">{stats.thisWeek}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workouts by Type */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Workouts by Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getWorkoutsByType()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="type" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Last 7 Days Activity */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Last 7 Days (minutes)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getLast7Days()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Line type="monotone" dataKey="minutes" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="bg-gray-800 p-6 rounded-lg mt-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {workouts.slice(0, 5).map((workout: any) => (
              <div key={workout.id} className="flex justify-between items-center border-b border-gray-700 pb-2">
                <div>
                  <p className="text-white font-semibold capitalize">{workout.type}</p>
                  <p className="text-gray-400 text-sm">{new Date(workout.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-white">{workout.duration} min</p>
                  {workout.distance > 0 && <p className="text-gray-400 text-sm">{workout.distance} km</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}