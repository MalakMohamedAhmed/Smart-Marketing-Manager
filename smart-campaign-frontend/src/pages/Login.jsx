import { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { FiArrowLeft, FiTrendingUp, FiTarget, FiZap } from 'react-icons/fi'

export default function Login({ onBack }) {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { continueAsGuest } = useAuth()

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    }
    setLoading(false)
  }

  const handleGuest = () => {
    continueAsGuest()
    onBack()
  }

  return (
    <div className="min-h-screen flex" style={{backgroundColor: '#0F0F13'}}>

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12"
        style={{background: 'linear-gradient(135deg, #1A1A24 0%, #24243A 100%)', borderRight: '1px solid #2E2E4A'}}>
        <div className="flex items-center gap-3">
          <div style={{backgroundColor: '#6C63FF'}} className="w-10 h-10 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">SC</span>
          </div>
          <span className="text-white font-bold text-xl">SmartCampaign</span>
        </div>

        <div>
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            Turn Data Into
            <span style={{color: '#6C63FF'}}> Revenue</span>
          </h2>
          <p className="text-gray-400 text-lg mb-12 leading-relaxed">
            Save your analysis, track progress over time, and get personalized recommendations.
          </p>
          <div className="flex flex-col gap-4">
            {[
              { icon: <FiTrendingUp size={18} />, text: 'Save and revisit past analyses' },
              { icon: <FiTarget size={18} />, text: 'Track campaign improvements over time' },
              { icon: <FiZap size={18} />, text: 'Get personalized AI recommendations' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl"
                style={{backgroundColor: '#0F0F1380', border: '1px solid #2E2E4A'}}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{backgroundColor: '#6C63FF22', color: '#6C63FF'}}>
                  {item.icon}
                </div>
                <span className="text-gray-300 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl" style={{backgroundColor: '#0F0F1380', border: '1px solid #2E2E4A'}}>
          <p className="text-gray-300 text-sm italic mb-3">
            "SmartCampaign helped us identify that 40% of our ad budget was being wasted on the wrong audience."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{backgroundColor: '#6C63FF'}}>A</div>
            <div>
              <p className="text-white text-sm font-medium">Ahmed Hassan</p>
              <p className="text-gray-500 text-xs">Marketing Director, TechStore EG</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">

          {/* Back Button */}
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
            <FiArrowLeft size={16} />
            Back to home
          </button>

          <h1 className="text-3xl font-bold text-white mb-2">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-gray-400 mb-8">
            {isSignup ? 'Start saving your campaign analyses' : 'Sign in to access your saved reports'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm text-red-400"
              style={{backgroundColor: '#7f1d1d33', border: '1px solid #f8717133'}}>
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none"
              style={{backgroundColor: '#1A1A24', border: '1px solid #2E2E4A'}}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none"
              style={{backgroundColor: '#1A1A24', border: '1px solid #2E2E4A'}}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white mb-3 transition-all hover:opacity-90"
            style={{backgroundColor: '#6C63FF', opacity: loading ? 0.7 : 1}}
          >
            {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{backgroundColor: '#2E2E4A'}}></div>
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px" style={{backgroundColor: '#2E2E4A'}}></div>
          </div>

          <button
            onClick={handleGuest}
            className="w-full py-3 rounded-xl font-semibold text-gray-400 hover:text-white transition-all"
            style={{border: '1px solid #2E2E4A', backgroundColor: '#1A1A24'}}
          >
            Continue as Guest →
          </button>

          <p className="text-center text-gray-500 text-xs mt-4">
            Guest mode lets you analyze campaigns without saving your data
          </p>

          <p className="text-center text-gray-400 text-sm mt-4">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => setIsSignup(!isSignup)}
              className="ml-1 font-medium hover:text-white transition-colors"
              style={{color: '#6C63FF'}}>
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

        </div>
      </div>
    </div>
  )
}