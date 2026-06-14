import { FiArrowUp, FiArrowDown, FiPause, FiTarget, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'

const priorityConfig = {
  high: { label: 'High Priority', color: '#f87171', bg: '#7f1d1d33' },
  medium: { label: 'Medium Priority', color: '#fbbf24', bg: '#78350f33' },
  low: { label: 'Low Priority', color: '#4ade80', bg: '#14532d33' },
}

export default function Recommendations({ analysisData }) {

  if (!analysisData) {
    return (
      <div className="py-24 px-6" style={{backgroundColor: '#1A1A24'}}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold mb-3" style={{color: '#6C63FF'}}>AI INSIGHTS</p>
          <h2 className="text-4xl font-bold text-white mb-4">
            Your <span style={{color: '#6C63FF'}}>Recommendations</span>
          </h2>
          <p className="text-gray-500 mt-4">Run an analysis to get AI-powered recommendations here.</p>
        </div>
      </div>
    )
  }

  const { recommendations } = analysisData
  const highCount = recommendations.filter(r => r.priority === 'high').length
  const mediumCount = recommendations.filter(r => r.priority === 'medium').length
  const totalSavings = recommendations
    .filter(r => r.action === 'Pause Campaign')
    .reduce((sum, r) => {
      const match = r.impact?.match(/\$([0-9,]+)/)
      return sum + (match ? parseInt(match[1].replace(',', '')) : 0)
    }, 0)

  return (
    <div className="py-24 px-6" style={{backgroundColor: '#1A1A24'}}>
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-sm font-semibold mb-3" style={{color: '#6C63FF'}}>AI INSIGHTS</p>
          <h2 className="text-4xl font-bold text-white mb-4">
            Your <span style={{color: '#6C63FF'}}>Recommendations</span>
          </h2>
          <p className="text-gray-400">AI-generated actions ranked by expected business impact.</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: <FiAlertCircle size={18} />, label: 'High Priority', value: highCount, color: '#f87171' },
            { icon: <FiAlertCircle size={18} />, label: 'Medium Priority', value: mediumCount, color: '#fbbf24' },
            { icon: <FiCheckCircle size={18} />, label: 'Est. Monthly Savings', value: `$${totalSavings.toLocaleString()}`, color: '#4ade80' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl text-center" style={{backgroundColor: '#0F0F13', border: '1px solid #2E2E4A'}}>
              <div className="flex justify-center mb-2" style={{color: item.color}}>{item.icon}</div>
              <div className="text-white font-bold text-xl">{item.value}</div>
              <div className="text-gray-400 text-xs mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Recommendation Cards */}
        <div className="flex flex-col gap-4">
          {recommendations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No recommendations generated.</div>
          ) : (
            recommendations.map((rec, i) => {
              const pc = priorityConfig[rec.priority] || priorityConfig.medium
              return (
                <div key={i} className="p-6 rounded-2xl transition-all hover:scale-[1.01]"
                  style={{backgroundColor: '#0F0F13', border: '1px solid #2E2E4A'}}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{backgroundColor: `${rec.color}22`, color: rec.color}}>
                      {rec.action === 'Scale Budget' ? <FiArrowUp size={20} /> :
                       rec.action === 'Pause Campaign' ? <FiPause size={20} /> :
                       rec.action === 'Reduce Budget' ? <FiArrowDown size={20} /> :
                       <FiTarget size={20} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{backgroundColor: pc.bg, color: pc.color}}>
                          {pc.label}
                        </span>
                        <span className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{backgroundColor: '#24243A', color: '#9ca3af'}}>
                          {rec.platform}
                        </span>
                        <span className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{backgroundColor: '#24243A', color: '#6C63FF'}}>
                          {rec.action}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">{rec.title}</h3>
                      <p className="text-gray-400 text-sm mb-3 leading-relaxed">{rec.reason}</p>
                      <div className="flex items-center gap-2">
                        <FiCheckCircle size={14} className="text-green-400" />
                        <span className="text-green-400 text-sm font-medium">Expected impact: {rec.impact}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}