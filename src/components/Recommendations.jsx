import { FiArrowUp, FiArrowDown, FiPause, FiTarget, FiAlertCircle, FiCheckCircle, FiRefreshCw, FiEdit, FiEye } from 'react-icons/fi'

const actionIcons = {
  'Scale Budget': <FiArrowUp size={20} />,
  'Reduce Budget': <FiArrowDown size={20} />,
  'Pause Campaign': <FiPause size={20} />,
  'Adjust Targeting': <FiTarget size={20} />,
  'Review Campaign': <FiEye size={20} />,
  'Refresh Creative': <FiRefreshCw size={20} />,
}

const priorityLabel = {
  high: { label: 'High Priority', color: '#f87171', bg: '#7f1d1d33' },
  medium: { label: 'Medium Priority', color: '#fbbf24', bg: '#78350f33' },
  low: { label: 'Low Priority', color: '#4ade80', bg: '#14532d33' },
}

const actionColor = {
  high: { color: '#f87171', bg: '#7f1d1d33' },
  medium: { color: '#fbbf24', bg: '#78350f33' },
  low: { color: '#4ade80', bg: '#14532d33' },
}

export default function Recommendations({ data }) {
  const hasData = data && data.recommendations && data.recommendations.length > 0

  if (!hasData) {
    return (
      <div className="py-24 px-6" style={{ backgroundColor: '#1A1A24' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold mb-3" style={{ color: '#6C63FF' }}>AI INSIGHTS</p>
            <h2 className="text-4xl font-bold text-white mb-4">
              Your <span style={{ color: '#6C63FF' }}>Recommendations</span>
            </h2>
            <p className="text-gray-400">AI-generated actions ranked by expected business impact.</p>
          </div>
          <div
            className="flex flex-col items-center justify-center rounded-2xl py-24 px-8 text-center"
            style={{ backgroundColor: '#0F0F13', border: '2px dashed #2E2E4A' }}
          >
            <div className="flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ backgroundColor: '#6C63FF18' }}>
              <FiTarget size={32} color="#6C63FF" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">No recommendations yet</h3>
            <p className="text-gray-400 text-sm max-w-sm">
              Upload your campaign data to get AI-generated actions ranked by expected business impact.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const { recommendations, rec_summary } = data

  return (
    <div className="py-24 px-6" style={{ backgroundColor: '#1A1A24' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold mb-3" style={{ color: '#6C63FF' }}>AI INSIGHTS</p>
          <h2 className="text-4xl font-bold text-white mb-4">
            Your <span style={{ color: '#6C63FF' }}>Recommendations</span>
          </h2>
          <p className="text-gray-400">AI-generated actions ranked by expected business impact.</p>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: <FiAlertCircle size={18} />, label: 'High Priority', value: rec_summary.high_priority, color: '#f87171' },
            { icon: <FiAlertCircle size={18} />, label: 'Medium Priority', value: rec_summary.medium_priority, color: '#fbbf24' },
            { icon: <FiCheckCircle size={18} />, label: 'Est. Monthly Savings', value: `$${rec_summary.est_monthly_savings.toLocaleString()}`, color: '#4ade80' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl text-center" style={{ backgroundColor: '#0F0F13', border: '1px solid #2E2E4A' }}>
              <div className="flex justify-center mb-2" style={{ color: item.color }}>{item.icon}</div>
              <div className="text-white font-bold text-xl">{item.value}</div>
              <div className="text-gray-400 text-xs mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Recommendation Cards */}
        <div className="flex flex-col gap-4">
          {recommendations.map((rec, i) => {
            const colors = actionColor[rec.priority] || actionColor.low
            const icon = actionIcons[rec.action] || <FiTarget size={20} />
            return (
              <div key={i} className="p-6 rounded-2xl transition-all hover:scale-[1.01]"
                style={{ backgroundColor: '#0F0F13', border: '1px solid #2E2E4A' }}>
                <div className="flex items-start gap-4">

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: colors.bg, color: colors.color }}>
                    {icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{ backgroundColor: priorityLabel[rec.priority].bg, color: priorityLabel[rec.priority].color }}>
                        {priorityLabel[rec.priority].label}
                      </span>
                      <span className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{ backgroundColor: '#24243A', color: '#9ca3af' }}>
                        {rec.platform}
                      </span>
                      <span className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{ backgroundColor: '#24243A', color: '#6C63FF' }}>
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
          })}
        </div>

      </div>
    </div>
  )
}