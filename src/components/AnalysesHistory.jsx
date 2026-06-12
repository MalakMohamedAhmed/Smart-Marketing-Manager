import { FiX, FiClock, FiBarChart2 } from 'react-icons/fi'
import { useAnalyses } from '../hooks/useAnalyses'

export default function AnalysesHistory({ onClose }) {
  const { analyses, loading } = useAnalyses()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{backgroundColor: 'rgba(0,0,0,0.7)'}}>
      <div className="w-full max-w-lg rounded-2xl p-6 relative"
        style={{backgroundColor: '#1A1A24', border: '1px solid #2E2E4A'}}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl">My Analyses</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading your analyses...</div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-12">
            <FiBarChart2 className="mx-auto mb-3 text-gray-600" size={40} />
            <p className="text-gray-400 font-medium">No analyses yet</p>
            <p className="text-gray-600 text-sm mt-1">Run your first analysis to see it here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
            {analyses.map((a) => (
              <div key={a.id} className="p-4 rounded-xl cursor-pointer hover:scale-[1.01] transition-all"
                style={{backgroundColor: '#0F0F13', border: '1px solid #2E2E4A'}}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-wrap gap-2">
                    {a.platforms?.map(p => (
                      <span key={p} className="text-xs px-2 py-1 rounded-full"
                        style={{backgroundColor: '#6C63FF22', color: '#6C63FF'}}>
                        {p}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <FiClock size={12} />
                    {a.timestamp?.toDate?.()?.toLocaleDateString() || 'Recently'}
                  </div>
                </div>
                <p className="text-gray-400 text-sm">Objective: {a.objective}</p>
                <div className="flex gap-3 mt-2">
                  {a.filesSummary?.map((f, i) => (
                    <span key={i} className="text-gray-500 text-xs">
                      {f.platform}: {f.rows} rows
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}