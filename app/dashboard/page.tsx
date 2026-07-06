'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
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

  const [showExerciseStats, setShowExerciseStats] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState('')
  const [exerciseStats, setExerciseStats] = useState<any>(null)
  const [exerciseStatsLoading, setExerciseStatsLoading] = useState(false)

  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [friends, setFriends] = useState<any[]>([])
  const [friendEmail, setFriendEmail] = useState('')
  const [friendMessage, setFriendMessage] = useState('')
  const [friendMessageIsError, setFriendMessageIsError] = useState(false)

  const loadFriendsData = () => {
    fetch('/api/friends?action=pending')
      .then(res => res.json())
      .then(d => setPendingRequests(Array.isArray(d) ? d : []))
      .catch(() => {})

    fetch('/api/friends?action=friends')
      .then(res => res.json())
      .then(d => setFriends(Array.isArray(d) ? d : []))
      .catch(() => {})
  }

  useEffect(() => {
    fetch('/api/gym?action=dashboardStats')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))

    loadFriendsData()
  }, [])

  const sendFriendRequest = async () => {
    setFriendMessage('')
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sendRequest', email: friendEmail })
      })
      const result = await res.json()
      if (!res.ok) {
        setFriendMessage(result.error || 'Something went wrong')
        setFriendMessageIsError(true)
      } else {
        setFriendMessage('Friend request sent')
        setFriendMessageIsError(false)
        setFriendEmail('')
        loadFriendsData()
      }
    } catch {
      setFriendMessage('Something went wrong')
      setFriendMessageIsError(true)
    }
  }

  const handleRequest = async (requestId: number, decision: 'accept' | 'decline') => {
    try {
      await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: decision, requestId })
      })
      loadFriendsData()
    } catch {}
  }

  useEffect(() => {
    if (!selectedExercise) return
    setExerciseStatsLoading(true)
    fetch(`/api/gym?action=exerciseStats&exerciseName=${encodeURIComponent(selectedExercise)}`)
      .then(res => res.json())
      .then(d => { setExerciseStats(d); setExerciseStatsLoading(false) })
      .catch(() => setExerciseStatsLoading(false))
  }, [selectedExercise])

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

  const formatAvgDuration = (seconds: number) => {
    const s = Math.round(seconds || 0)
    const hours = Math.floor(s / 3600)
    const mins = Math.round((s % 3600) / 60)
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} min`
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Gym Dashboard</h1>
          <button
            onClick={() => setShowExerciseStats(!showExerciseStats)}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700"
          >
            {showExerciseStats ? 'Hide Stats by Exercise' : 'Stats by Exercise'}
          </button>
        </div>

        {!showExerciseStats && (
        <>
        {/* Stats Cards Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm uppercase mb-2">Total Workouts This Week</p>
            <p className="text-white text-3xl font-bold">{stats.sessions_this_week}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm uppercase mb-2">Total Workouts This Month</p>
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
          <div className="bg-gradient-to-br from-purple-900/50 to-gray-800 p-6 rounded-lg border border-purple-500/30">
            <p className="text-purple-300 text-sm uppercase mb-2">Heaviest Lift</p>
            <p className="text-white text-3xl font-bold">{heaviestWeight} lbs</p>
          </div>
          <div className="bg-gradient-to-br from-teal-900/50 to-gray-800 p-6 rounded-lg border border-teal-500/30">
            <p className="text-teal-300 text-sm uppercase mb-2">Avg Session Duration</p>
            <p className="text-white text-3xl font-bold">{formatAvgDuration(stats.avg_duration_seconds)}</p>
          </div>
        </div>
        </>
        )}

        {/* Stats by Exercise */}
        {showExerciseStats && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Stats by Exercise</h2>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg mb-6 w-full max-w-xs"
            >
              <option value="">Select an exercise...</option>
              {exerciseFrequency.map((e: any) => (
                <option key={e.name} value={e.name}>{e.name}</option>
              ))}
            </select>

            {exerciseStatsLoading && <p className="text-gray-400">Loading...</p>}

            {!exerciseStatsLoading && exerciseStats && selectedExercise && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-gray-400 text-xs uppercase mb-1">PR</p>
                    <p className="text-white text-2xl font-bold">{parseFloat(exerciseStats.summary.pr_weight)} lbs</p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-gray-400 text-xs uppercase mb-1">Sessions</p>
                    <p className="text-white text-2xl font-bold">{exerciseStats.summary.total_sessions}</p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-gray-400 text-xs uppercase mb-1">Total Volume</p>
                    <p className="text-white text-2xl font-bold">{formatVolume(parseFloat(exerciseStats.summary.total_volume))}</p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-gray-400 text-xs uppercase mb-1">Avg Weight</p>
                    <p className="text-white text-2xl font-bold">{parseFloat(exerciseStats.summary.avg_weight).toFixed(1)} lbs</p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={exerciseStats.progression.map((p: any) => ({
                    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    weight: parseFloat(p.top_weight)
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                      labelStyle={{ color: '#F3F4F6' }}
                      formatter={(value: any) => [`${value} lbs`, 'Top Set Weight']}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        )}

        {!showExerciseStats && (
        <>
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
        </>
        )}

        {/* Friends Section */}
        <div className="bg-gray-800 p-6 rounded-lg mt-6">
          <h2 className="text-xl font-bold text-white mb-4">Friends</h2>

          {/* Pending requests */}
          {pendingRequests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">
                Pending Requests ({pendingRequests.length})
              </h3>
              <div className="space-y-2">
                {pendingRequests.map((req: any) => (
                  <div key={req.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                    <p className="text-white">{req.sender_email}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRequest(req.id, 'accept')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRequest(req.id, 'decline')}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-500"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invite a friend */}
          <div className="mb-6">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Invite a Friend</h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                placeholder="friend@email.com"
                className="flex-1 p-3 rounded-lg bg-gray-700 text-white"
              />
              <button
                onClick={sendFriendRequest}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Send Request
              </button>
            </div>
            {friendMessage && (
              <p className={`mt-2 text-sm ${friendMessageIsError ? 'text-red-400' : 'text-green-400'}`}>
                {friendMessage}
              </p>
            )}
            {friendMessage && friendMessage.includes('No account') && (
              <p className="text-gray-400 text-sm mt-1">
                Share this link with them to sign up:{' '}
                <span className="text-blue-400">setsandreps.vercel.app/register</span>
              </p>
            )}
          </div>

          {/* Friends list with stats */}
          {friends.length === 0 ? (
            <p className="text-gray-500 text-sm">No friends added yet. Invite someone above!</p>
          ) : (
            <div className="space-y-4">
              <h3 className="text-gray-400 text-sm uppercase tracking-wider">Friends</h3>
              {friends.map((friend: any) => (
                <div key={friend.id} className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-white font-semibold mb-3">{friend.email}</p>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="bg-gray-600 p-3 rounded-lg text-center">
                      <p className="text-white font-bold text-xl">{friend.sessions?.sessions_this_week ?? 0}</p>
                      <p className="text-gray-400 text-xs">Sessions this week</p>
                    </div>
                    <div className="bg-gray-600 p-3 rounded-lg text-center">
                      <p className="text-white font-bold text-xl">{friend.sessions?.sessions_this_month ?? 0}</p>
                      <p className="text-gray-400 text-xs">Sessions this month</p>
                    </div>
                  </div>
                  {friend.prs && friend.prs.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Top PRs</p>
                      <div className="flex flex-wrap gap-2">
                        {friend.prs.map((pr: any) => (
                          <span key={pr.exercise_name} className="bg-gray-600 px-3 py-1 rounded-full text-sm">
                            <span className="text-white">{pr.exercise_name}</span>
                            <span className="text-green-400 ml-2">{pr.max_weight} lbs</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}