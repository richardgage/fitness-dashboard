import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { getUserIdByEmail, getUserById, updateDisplayName, updateDefaultRestTime } from '@/lib/db'

async function getUserId() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  return await getUserIdByEmail(session.user.email)
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  try {
    const user = await getUserById(userId)
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  const body = await request.json()

  try {
    if (typeof body.displayName === 'string') {
      const displayName = body.displayName.trim()
      if (!displayName) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
      }
      const user = await updateDisplayName(userId, displayName)
      return NextResponse.json(user)
    }

    if (typeof body.defaultRestSeconds === 'number') {
      if (body.defaultRestSeconds <= 0) {
        return NextResponse.json({ error: 'Rest time must be greater than 0' }, { status: 400 })
      }
      const user = await updateDefaultRestTime(userId, body.defaultRestSeconds)
      return NextResponse.json(user)
    }

    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}