import { useState, useEffect } from 'react'
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export function useAnalyses() {
  const { currentUser } = useAuth()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(false)

  const saveAnalysis = async (data) => {
    if (!currentUser) return
    try {
      await addDoc(collection(db, 'analyses'), {
        userId: currentUser.uid,
        timestamp: new Date(),
        platforms: data.platforms,
        objective: data.objective,
        filesSummary: data.filesSummary,
      })
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  const fetchAnalyses = async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const q = query(
        collection(db, 'analyses'),
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc')
      )
      const snap = await getDocs(q)
      setAnalyses(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('Fetch failed:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (currentUser) fetchAnalyses()
  }, [currentUser])

  return { analyses, saveAnalysis, fetchAnalyses, loading }
}