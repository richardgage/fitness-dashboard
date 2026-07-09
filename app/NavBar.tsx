'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Home, BarChart2, Dumbbell, History, User } from 'lucide-react'

export default function NavBar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <>
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 text-xl font-bold hover:text-blue-400">
              Stronger Together
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
                  <Link href="/activities" className="text-gray-300 hover:text-white transition-colors">Activities</Link>
                  <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Visual Stats</Link>
                  <Link href="/gym/active" className="text-gray-300 hover:text-white transition-colors">Start Workout</Link>
                  <Link href="/gym/history" className="text-gray-300 hover:text-white transition-colors">Gym History</Link>
                  <Link href="/feedback" className="text-gray-300 hover:text-white transition-colors">Feedback</Link>
                  <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">Profile</Link>
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

          {/* Mobile dropdown menu — just the items not covered by the bottom nav */}
          {menuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              {session ? (
                <>
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

      {/* Mobile bottom nav — Strava-style, fixed, always visible */}
      {session && (
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-800 border-t border-gray-700"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex items-center justify-around h-16">
            <Link
              href="/activities"
              className={`flex flex-col items-center gap-1 ${isActive('/activities') ? 'text-blue-400' : 'text-gray-400'}`}
            >
              <Home size={22} />
              <span className="text-[10px]">Activities</span>
            </Link>

            <Link
              href="/dashboard"
              className={`flex flex-col items-center gap-1 ${isActive('/dashboard') ? 'text-blue-400' : 'text-gray-400'}`}
            >
              <BarChart2 size={22} />
              <span className="text-[10px]">Stats</span>
            </Link>

            <Link href="/gym/active" className="flex flex-col items-center -mt-6">
              <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center shadow-lg border-4 border-gray-800">
                <Dumbbell size={24} className="text-white" />
              </div>
            </Link>

            <Link
              href="/gym/history"
              className={`flex flex-col items-center gap-1 ${isActive('/gym/history') ? 'text-blue-400' : 'text-gray-400'}`}
            >
              <History size={22} />
              <span className="text-[10px]">History</span>
            </Link>

            <Link
              href="/profile"
              className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-blue-400' : 'text-gray-400'}`}
            >
              <User size={22} />
              <span className="text-[10px]">Profile</span>
            </Link>
          </div>
        </div>
      )}
    </>
  )
}