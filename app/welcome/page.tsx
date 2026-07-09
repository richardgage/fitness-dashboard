'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Welcome() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 50)
    const redirectTimer = setTimeout(() => {
      router.push('/activities')
    }, 3000)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(redirectTimer)
    }
  }, [router])

  return (
    <div
      onClick={() => router.push('/activities')}
      className="min-h-screen bg-gray-900 flex items-center justify-center cursor-pointer"
    >
      <h1
        className={`text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 leading-normal pb-2 transition-all duration-700 ease-out ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        Stronger Together
      </h1>
    </div>
  )
}