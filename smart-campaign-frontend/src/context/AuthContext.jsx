import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [isGuest, setIsGuest] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })
    return unsub
  }, [])

  const continueAsGuest = () => setIsGuest(true)
  const exitGuest = () => setIsGuest(false)

  return (
    <AuthContext.Provider value={{ currentUser, isGuest, continueAsGuest, exitGuest }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}