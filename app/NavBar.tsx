'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function NavBar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-white text-xl font-bold hover:text-blue-400">
            Fitness Tracker
          </Link>
          <div className="flex gap-6 items-center">
            {session ? (
              <>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/gym" className="text-gray-300 hover:text-white transition-colors">Gym</Link>
                <Link href="/feedback" className="text-gray-300 hover:text-white transition-colors">Feedback</Link>
                <span className="text-gray-500 text-sm">{session.user?.email}</span>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors">Log In</Link>
                <Link href="/register" className="text-gray-300 hover:text-white transition-colors">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}