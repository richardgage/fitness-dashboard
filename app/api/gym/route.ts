import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import {
  getAllGymSessions,
  getSessionDetails,
  startGymSession,
  endGymSession,
  addExerciseToSession,
  addSetToExercise,
  getActiveSession,
  getLastWorkoutForExercise,
  getGymDashboardStats,
  getExerciseFrequency,
  getVolumeOverTime,
  getUserIdByEmail
} from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import {sql} from '@vercel/postgres'
import { getUserExercises, addUserExercise } from '@/lib/db'


async function getUserId() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  return await getUserIdByEmail(session.user.email)
}

export async function GET(request: Request) {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const sessionId = searchParams.get('sessionId')
  const exerciseName = searchParams.get('exerciseName')

  try {
    if (action === 'details' && sessionId) {
      const data = await getSessionDetails(parseInt(sessionId))
      return NextResponse.json(data)
    }

    if (action === 'active') {
      const data = await getActiveSession(userId)
      return NextResponse.json(data)
    }

    if (action === 'lastWorkout' && exerciseName) {
      const data = await getLastWorkoutForExercise(exerciseName)
      return NextResponse.json(data)
    }

    if (action === 'dashboardStats') {
      const [stats, exerciseFrequency, volumeOverTime, recentSessions] = await Promise.all([
        getGymDashboardStats(userId),
        getExerciseFrequency(userId),
        getVolumeOverTime(userId),
        getAllGymSessions(userId)
      ])
      return NextResponse.json({
        stats,
        exerciseFrequency,
        volumeOverTime,
        recentSessions: recentSessions.slice(0, 5)
      })
    }

    if (action === 'userExercises') {
      const data = await getUserExercises(userId)
      return NextResponse.json(data)
}

    const data = await getAllGymSessions(userId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Gym API error:', error)  // add this line
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const userId = await getUserId()
  console.log('POST userId:', userId)  // add this
  if (!userId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  const body = await request.json()
  const { action } = body

  try {
    if (action === 'startSession') {
      console.log('Starting session with userId:', userId)  // add this
      const data = await startGymSession(body.date, userId)
      console.log('Session created:', data)  // add this
      return NextResponse.json(data)
    }

    if (action === 'endSession') {
      const data = await endGymSession(body.sessionId, body.notes)
      return NextResponse.json(data)
    }

    if (action === 'saveUserExercise') {
      const data = await addUserExercise(userId, body.exerciseName)
      return NextResponse.json(data)
    }

    if (action === 'addSet') {
      const data = await addSetToExercise(body.exerciseId, body.setNumber, body.weight, body.reps)
      return NextResponse.json(data)
    }

    if (action === 'addExercise') {
      console.log('Adding exercise:', body.exerciseName, 'to session:', body.sessionId)
      const data = await addExerciseToSession(body.sessionId, body.exerciseName, body.order)
      console.log('Exercise saved:', data)

      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json({ error: 'No session ID provided' }, { status: 400 })
  }

  try {
    await sql`DELETE FROM gym_sessions WHERE id = ${parseInt(sessionId)} AND user_id = ${userId}`
    return NextResponse.json({ message: 'Workout deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}