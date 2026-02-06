'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

const formatVolume = (lbs: number) => {
  const val = parseFloat(String(lbs)) || 0
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M lbs`
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K lbs`
  return `${val.toLocaleString()} lbs`
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/gym?action=dashboardStats')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
        <p className="text-white text-xl">Loading dashboard...</p>
      </div>
    )
  }

  if (!data || !data.stats || data.stats.total_sessions === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-8">Gym Dashboard</h1>
          <div className="bg-gray-800 p-8 rounded-lg">
            <p className="text-gray-400 mb-6">No workouts logged yet. Start your first workout to see stats here.</p>
            <Link
              href="/gym/active"
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-green-700"
            >
              Start a Workout
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { stats, exerciseFrequency, volumeOverTime, recentSessions } = data

  const totalVolume = parseFloat(stats.total_volume) || 0
  const volumeThisWeek = parseFloat(stats.volume_this_week) || 0
  const heaviestWeight = parseFloat(stats.heaviest_weight) || 0

  // Monthly volume for bar chart
  const getMonthlyVolume = () => {
    const byMonth: { [key: string]: number } = {}
    volumeOverTime.forEach((s: any) => {
      const month = new Date(s.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      byMonth[month] = (byMonth[month] || 0) + (parseFloat(s.session_volume) || 0)
    })
    return Object.entries(byMonth)
      .map(([month, volume]) => ({ month, volume: Math.round(volume) }))
      .slice(-6)
  }

  // Volume over time for area chart (last 20 sessions)
  const getVolumeChartData = () => {
    return volumeOverTime.slice(-20).map((s: any) => ({
      date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: parseFloat(s.session_volume) || 0
    }))
  }

  // Exercise frequency for pie chart
  const getPieData = () => {
    return exerciseFrequency.slice(0, 8).map((e: any) => ({
      name: e.name,
      value: parseInt(e.session_count)
    }))
  }

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000)
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} min`
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Gym Dashboard</h1>

        {/* Stats Cards Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm uppercase mb-2">Total Workouts</p>
            <p className="text-white text-3xl font-bold">{stats.total_sessions}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm uppercase mb-2">This Week</p>
            <p className="text-white text-3xl font-bold">{stats.sessions_this_week}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm uppercase mb-2">This Month</p>
            <p className="text-white text-3xl font-bold">{stats.sessions_this_month}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm uppercase mb-2">Total Volume</p>
            <p className="text-white text-3xl font-bold">{formatVolume(totalVolume)}</p>
          </div>
        </div>

        {/* Stats Cards Row 2 - Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900/50 to-gray-800 p-6 rounded-lg border border-blue-500/30">
            <p className="text-blue-300 text-sm uppercase mb-2">Volume This Week</p>
            <p className="text-white text-3xl font-bold">{formatVolume(volumeThisWeek)}</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/50 to-gray-800 p-6 rounded-lg border border-green-500/30">
            <p className="text-green-300 text-sm uppercase mb-2">Total Sets</p>
            <p className="text-white text-3xl font-bold">{stats.total_sets}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/50 to-gray-800 p-6 rounded-lg border border-purple-500/30">
            <p className="text-purple-300 text-sm uppercase mb-2">Heaviest Lift</p>
            <p className="text-white text-3xl font-bold">{heaviestWeight} lbs</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Volume Over Time */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Volume Per Session</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getVolumeChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                  formatter={(value: any) => [formatVolume(value), 'Volume']}
                />
                <Area type="monotone" dataKey="volume" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Exercise Frequency Pie */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Exercise Frequency</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getPieData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getPieData().map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Volume */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Monthly Volume</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getMonthlyVolume()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                  formatter={(value: any) => [formatVolume(value), 'Volume']}
                />
                <Bar dataKey="volume" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Exercises by Volume */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Top Exercises by Volume</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={exerciseFrequency.slice(0, 6).map((e: any) => ({
                  name: e.name,
                  volume: parseFloat(e.total_volume) || 0
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                <YAxis type="category" dataKey="name" stroke="#9CA3AF" width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                  formatter={(value: any) => [formatVolume(value), 'Volume']}
                />
                <Bar dataKey="volume" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Recent Workouts</h2>
          <div className="space-y-3">
            {recentSessions.map((session: any) => (
              <Link
                key={session.id}
                href={`/gym/workout/${session.id}`}
                className="flex justify-between items-center border-b border-gray-700 pb-3 hover:bg-gray-700/50 rounded px-2 -mx-2 transition-colors"
              >
                <div>
                  <p className="text-white font-semibold">
                    {new Date(session.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {formatDuration(session.start_time, session.end_time)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 font-semibold">
                    {session.exercise_count} {parseInt(session.exercise_count) === 1 ? 'exercise' : 'exercises'}
                  </p>
                  <p className="text-gray-400 text-sm">{session.total_sets} sets</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
