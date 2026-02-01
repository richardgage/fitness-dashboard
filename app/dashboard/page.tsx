'use client'
import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function Dashboard() {
  const [workouts, setWorkouts] = useState([])
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalDuration: 0,
    totalDistance: 0,
    thisWeek: 0,
    thisMonth: 0,
    longestWorkout: 0,
    longestDistance: 0,
    avgDuration: 0
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

    const longestWorkout = Math.max(...workouts.map(w => w.duration), 0)
    const longestDistance = Math.max(...workouts.map(w => parseFloat(w.distance || 0)), 0)
    const avgDuration = workouts.length > 0 ? Math.round(totalDuration / workouts.length) : 0

    setStats({
      totalWorkouts: workouts.length,
      totalDuration,
      totalDistance: Math.round(totalDistance * 10) / 10,
      thisWeek,
      thisMonth,
      longestWorkout,
      longestDistance: Math.round(longestDistance * 10) / 10,
      avgDuration
    })
  }

  // Workouts by type for pie chart
  const getWorkoutsByType = () => {
    const byType: { [key: string]: number } = {}
    workouts.forEach((w: any) => {
      byType[w.type] = (byType[w.type] || 0) + 1
    })
    return Object.entries(byType).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count
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

  // Cumulative distance over time
  const getCumulativeDistance = () => {
    const sorted = [...workouts]
      .filter((w: any) => w.distance > 0)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    let cumulative = 0
    return sorted.map((w: any) => {
      cumulative += parseFloat(w.distance)
      return {
        date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        distance: Math.round(cumulative * 10) / 10
      }
    }).slice(-30) // Last 30 workouts with distance
  }

  // Monthly totals
  const getMonthlyTotals = () => {
    const byMonth: { [key: string]: number } = {}
    
    workouts.forEach((w: any) => {
      const month = new Date(w.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      byMonth[month] = (byMonth[month] || 0) + w.duration
    })
    
    return Object.entries(byMonth)
      .map(([month, minutes]) => ({ month, hours: Math.round(minutes / 60 * 10) / 10 }))
      .slice(-6) // Last 6 months
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Training Dashboard</h1>

        {/* Stats Cards Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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

        {/* Stats Cards Row 2 - Personal Records */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900/50 to-gray-800 p-6 rounded-lg border border-blue-500/30">
            <p className="text-blue-300 text-sm uppercase mb-2">Longest Workout</p>
            <p className="text-white text-3xl font-bold">{stats.longestWorkout} min</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/50 to-gray-800 p-6 rounded-lg border border-green-500/30">
            <p className="text-green-300 text-sm uppercase mb-2">Longest Distance</p>
            <p className="text-white text-3xl font-bold">{stats.longestDistance} km</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/50 to-gray-800 p-6 rounded-lg border border-purple-500/30">
            <p className="text-purple-300 text-sm uppercase mb-2">Avg Workout</p>
            <p className="text-white text-3xl font-bold">{stats.avgDuration} min</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

          {/* Workouts by Type - Pie Chart */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Activity Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getWorkoutsByType()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getWorkoutsByType().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Cumulative Distance */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Cumulative Distance (km)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getCumulativeDistance()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Area type="monotone" dataKey="distance" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Training Hours */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Monthly Training (hours)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getMonthlyTotals()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Bar dataKey="hours" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="bg-gray-800 p-6 rounded-lg">
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