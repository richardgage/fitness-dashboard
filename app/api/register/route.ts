import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createUser, getUserByEmail } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await createUser(email, hashedPassword, name.trim())

    return NextResponse.json({ message: 'Account created successfully', user })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}