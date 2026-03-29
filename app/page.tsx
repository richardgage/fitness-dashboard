import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 relative overflow-hidden flex flex-col items-center justify-center px-6">

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center">

        {/* Icon */}
        <div className="text-6xl mb-6">🏋️</div>

        {/* Title */}
        <h1 className="text-6xl font-black text-white mb-4 leading-tight tracking-tight">
          Sets &<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            Reps
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-lg mb-4 leading-relaxed">
          Track your lifts. Beat your records. <br className="hidden sm:block" />
          Built for serious training.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {['Rest Timer', 'PR Tracking', 'Workout History', 'Volume Analytics'].map(feature => (
            <span
              key={feature}
              className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-3 py-1 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/register"
            className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl text-lg font-bold transition-colors"
          >
            Get Started — It's Free
          </Link>
          <Link
            href="/login"
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
          >
            Log In
          </Link>
        </div>

        {/* Social proof */}
        <p className="text-gray-600 text-sm">
          Already tracking with friends? Log in above.
        </p>
      </div>

      {/* Bottom stats bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-center gap-12">
          {[
            { label: 'Track Sets & Reps', icon: '📊' },
            { label: 'Rest Timer', icon: '⏱️' },
            { label: 'Beat Your PRs', icon: '🏆' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <div className="text-xl mb-1">{item.icon}</div>
              <div className="text-gray-500 text-xs">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

    </main>
  )
}