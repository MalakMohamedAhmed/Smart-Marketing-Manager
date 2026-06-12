import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Upload from './components/Upload'
import Dashboard from './components/Dashboard'
import Recommendations from './components/Recommendations'
import Footer from './components/Footer'

function AppContent() {
  const { currentUser, isGuest } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)

  if (showLogin && !currentUser && !isGuest) {
    return <Login onBack={() => setShowLogin(false)} />
  }
  return (
    <div className="min-h-screen" style={{backgroundColor: '#0F0F13'}}>
      <Navbar onLoginClick={() => setShowLogin(true)} />
      <section id="hero"><Hero onLoginClick={() => setShowLogin(true)} /></section>
      <section id="features"><Features /></section>
      <section id="upload"><Upload onAnalysisComplete={setAnalysisResult} /></section>
      <section id="dashboard"><Dashboard data={analysisResult} /></section>
      <section id="recommendations">
        <Recommendations data={analysisResult} />
      </section>
      <Footer />
    </div>
  )
}
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}