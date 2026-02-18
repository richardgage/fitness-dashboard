'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function NavBar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-white text-xl font-bold hover:text-blue-400">
            Gym Tracker
          </Link>

          {/* Hamburger button for mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-300 hover:text-white p-2"
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex gap-6 items-center">
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

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {session ? (
              <>
                <p className="text-gray-500 text-sm px-2 pb-2">{session.user?.email}</p>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white py-2 px-2">Dashboard</Link>
                <Link href="/gym" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white py-2 px-2">Gym</Link>
                <Link href="/feedback" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white py-2 px-2">Feedback</Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="block text-red-400 hover:text-red-300 py-2 px-2"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white py-2 px-2">Log In</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white py-2 px-2">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}