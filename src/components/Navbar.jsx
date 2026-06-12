import { FiMenu, FiX, FiUser, FiClock } from 'react-icons/fi'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import AnalysesHistory from './AnalysesHistory'

export default function Navbar({ onLoginClick }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const { currentUser, isGuest, exitGuest } = useAuth()

  const handleSignOut = async () => {
    await signOut(auth)
    exitGuest()
  }

  return (
    <>
      {showHistory && <AnalysesHistory onClose={() => setShowHistory(false)} />}

      <nav style={{backgroundColor: '#1A1A24', borderBottom: '1px solid #2E2E4A'}}
        className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div style={{backgroundColor: '#6C63FF'}} className="w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <span className="text-white font-bold text-xl">SmartCampaign</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a>
            <a href="#upload" className="text-gray-400 hover:text-white transition-colors text-sm">Analyze</a>
            <a href="#dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">Dashboard</a>
            <a href="#recommendations" className="text-gray-400 hover:text-white transition-colors text-sm">Recommendations</a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button onClick={() => setShowHistory(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:text-white"
                  style={{backgroundColor: '#24243A', color: '#9ca3af'}}>
                  <FiClock size={14} />
                  My Analyses
                </button>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{backgroundColor: '#24243A'}}>
                  <FiUser size={14} className="text-gray-400" />
                  <span className="text-gray-300 text-sm">{currentUser.email}</span>
                </div>
                <button onClick={handleSignOut}
                  className="text-gray-400 hover:text-white text-sm transition-colors px-4 py-2">
                  Sign Out
                </button>
              </div>
            ) : isGuest ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm">Guest mode</span>
                <button onClick={onLoginClick} style={{backgroundColor: '#6C63FF'}}
                  className="text-white text-sm px-4 py-2 rounded-lg hover:opacity-90">
                  Save Progress
                </button>
              </div>
            ) : (
              <button onClick={onLoginClick} style={{backgroundColor: '#6C63FF'}}
                className="text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                Login / Sign Up
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-400" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{backgroundColor: '#1A1A24'}} className="md:hidden px-6 pb-4 flex flex-col gap-4">
            <a href="#features" className="text-gray-400 hover:text-white text-sm">Features</a>
            <a href="#upload" className="text-gray-400 hover:text-white text-sm">Analyze</a>
            <a href="#dashboard" className="text-gray-400 hover:text-white text-sm">Dashboard</a>
            <a href="#recommendations" className="text-gray-400 hover:text-white text-sm">Recommendations</a>
            <button onClick={onLoginClick} style={{backgroundColor: '#6C63FF'}}
              className="text-white text-sm px-4 py-2 rounded-lg w-full">
              Login / Sign Up
            </button>
          </div>
        )}
      </nav>
    </>
  )
}