import { FiUpload, FiBarChart2, FiZap, FiTarget, FiTrendingUp, FiClock } from 'react-icons/fi'

const features = [
  {
    icon: <FiUpload size={24} />,
    title: "Multi-Platform Upload",
    description: "Import campaign data from Facebook, Google, TikTok, Instagram and more via simple CSV upload."
  },
  {
    icon: <FiBarChart2 size={24} />,
    title: "Performance Analysis",
    description: "Deep analysis of KPIs including CTR, CPA, ROI, and conversion rates across all your campaigns."
  },
  {
    icon: <FiZap size={24} />,
    title: "AI Recommendations",
    description: "Get instant, actionable recommendations powered by machine learning to improve campaign performance."
  },
  {
    icon: <FiTarget size={24} />,
    title: "Audience Insights",
    description: "Identify which audience segments perform best and where to focus your targeting efforts."
  },
  {
    icon: <FiTrendingUp size={24} />,
    title: "Budget Optimization",
    description: "Know exactly which campaigns to scale, pause, or adjust to get the most from your budget."
  },
  {
    icon: <FiClock size={24} />,
    title: "Save 50% of Your Time",
    description: "Eliminate hours of manual data analysis. Get insights in minutes, not days."
  }
]

export default function Features() {
  return (
    <div className="py-24 px-6" style={{backgroundColor: '#0F0F13'}}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold mb-3" style={{color: '#6C63FF'}}>WHAT WE OFFER</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to
            <span style={{color: '#6C63FF'}}> Win</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Stop wasting budget on underperforming campaigns. Our AI gives you the clarity to make smarter marketing decisions.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl transition-all hover:scale-105 cursor-default"
              style={{backgroundColor: '#1A1A24', border: '1px solid #2E2E4A'}}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{backgroundColor: '#24243A', color: '#6C63FF'}}>
                {feature.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}