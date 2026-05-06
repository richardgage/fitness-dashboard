import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import {
  getUserByEmail,
  getUserIdByEmail,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getPendingFriendRequests,
  getFriends,
  getFriendStats
} from '@/lib/db'

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

  try {
    if (action === 'pending') {
      const data = await getPendingFriendRequests(userId)
      return NextResponse.json(data)
    }

    if (action === 'friends') {
      const friends = await getFriends(userId)
      const friendsWithStats = await Promise.all(
        friends.map(async (friend: any) => {
          const stats = await getFriendStats(friend.id)
          return { ...friend, ...stats }
        })
      )
      return NextResponse.json(friendsWithStats)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Friends API error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  const body = await request.json()
  const { action } = body

  try {
    if (action === 'sendRequest') {
      const friend = await getUserByEmail(body.email)
      if (!friend) {
        return NextResponse.json({ error: 'No account found with that email' }, { status: 404 })
      }
      if (friend.id === userId) {
        return NextResponse.json({ error: 'You cannot add yourself' }, { status: 400 })
      }
      const data = await sendFriendRequest(userId, friend.id)
      if (!data) {
        return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 })
      }
      return NextResponse.json({ message: 'Friend request sent!' })
    }

    if (action === 'accept') {
      const data = await acceptFriendRequest(body.requestId, userId)
      return NextResponse.json(data)
    }

    if (action === 'decline') {
      const data = await declineFriendRequest(body.requestId, userId)
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Friends API error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}