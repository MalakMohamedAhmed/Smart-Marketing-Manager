import { useAuth } from '../context/AuthContext'

export default function Hero({ onLoginClick }) {
  const { currentUser, isGuest } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20"
      style={{background: 'linear-gradient(135deg, #0F0F13 0%, #1a1a2e 50%, #0F0F13 100%)'}}>
      <div className="max-w-4xl mx-auto text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8"
          style={{backgroundColor: '#24243A', border: '1px solid #6C63FF', color: '#6C63FF'}}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          AI-Powered Campaign Intelligence
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Stop Guessing,
          <span style={{color: '#6C63FF'}}> Start Growing</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Upload your campaign data and let our AI analyze performance across all platforms — get clear, actionable recommendations to maximize your ROI instantly.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <a href="#upload">
            <button style={{backgroundColor: '#6C63FF'}}
              className="text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all transform hover:scale-105">
              Analyze My Campaigns →
            </button>
          </a>
          {!currentUser && !isGuest && (
            <button
              onClick={onLoginClick}
              className="text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg hover:text-white transition-colors"
              style={{border: '1px solid #2E2E4A'}}>
              Sign In / Sign Up
            </button>
          )}
        </div>

        {/* Guest note */}
        {!currentUser && !isGuest && (
          <p className="text-gray-500 text-sm mb-12">
            No account needed —
            <a href="#upload" className="ml-1 hover:text-white transition-colors" style={{color: '#6C63FF'}}>
              continue as guest
            </a>
            {' '}to analyze without saving your analysis.
          </p>
        )}

        {/* Logged in note */}
        {currentUser && (
          <p className="text-gray-500 text-sm mb-12">
            Welcome back, <span style={{color: '#6C63FF'}}>{currentUser.email}</span> — your analyses are saved automatically
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">+25%</div>
            <div className="text-gray-500 text-sm">Average ROI Increase</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">-15%</div>
            <div className="text-gray-500 text-sm">Cost Per Acquisition</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">50%</div>
            <div className="text-gray-500 text-sm">Time Saved</div>
          </div>
        </div>

      </div>
    </div>
  )
}