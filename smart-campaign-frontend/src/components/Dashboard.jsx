import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function Dashboard({ analysisData }) {
  
  // If no data yet, show placeholder
  if (!analysisData) {
    return (
      <div className="py-24 px-6" style={{backgroundColor: '#0F0F13'}}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm font-semibold mb-3" style={{color: '#6C63FF'}}>LIVE DASHBOARD</p>
          <h2 className="text-4xl font-bold text-white mb-4">
            Your Campaign <span style={{color: '#6C63FF'}}>Performance</span>
          </h2>
          <p className="text-gray-500 mt-4">Upload and analyze your campaigns to see your dashboard here.</p>
        </div>
      </div>
    )
  }

  const { campaigns, kpis } = analysisData

  // Build chart data from campaigns
  const roiChartData = campaigns.map(c => ({
    name: c.campaign_name?.substring(0, 12) || 'Campaign',
    roi: parseFloat((c.roi * 100 || 0).toFixed(1))
  }))

  const conversionChartData = campaigns.map(c => ({
    name: c.campaign_name?.substring(0, 12) || 'Campaign',
    conversions: Math.round(c.conversions || 0)
  }))

  const kpiCards = [
    { label: 'Total Spend', value: `$${(kpis.total_spend || 0).toLocaleString()}`, change: '', positive: false },
    { label: 'Total Conversions', value: (kpis.total_conversions || 0).toLocaleString(), change: '', positive: true },
    { label: 'Avg. ROI', value: `${kpis.avg_roi || 0}%`, change: '', positive: true },
    { label: 'Avg. CTR', value: `${kpis.avg_ctr || 0}%`, change: '', positive: true },
  ]

  return (
    <div className="py-24 px-6" style={{backgroundColor: '#0F0F13'}}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold mb-3" style={{color: '#6C63FF'}}>LIVE DASHBOARD</p>
          <h2 className="text-4xl font-bold text-white mb-4">
            Your Campaign <span style={{color: '#6C63FF'}}>Performance</span>
          </h2>
          <p className="text-gray-400">Results from your latest analysis.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((kpi, i) => (
            <div key={i} className="p-5 rounded-2xl" style={{backgroundColor: '#1A1A24', border: '1px solid #2E2E4A'}}>
              <p className="text-gray-400 text-sm mb-2">{kpi.label}</p>
              <p className="text-white text-2xl font-bold">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-2xl" style={{backgroundColor: '#1A1A24', border: '1px solid #2E2E4A'}}>
            <h3 className="text-white font-semibold mb-6">ROI by Campaign</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={roiChartData}>
                <defs>
                  <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E2E4A" />
                <XAxis dataKey="name" stroke="#6b7280" tick={{fontSize: 11}} />
                <YAxis stroke="#6b7280" tick={{fontSize: 11}} />
                <Tooltip contentStyle={{backgroundColor: '#1A1A24', border: '1px solid #2E2E4A', borderRadius: '8px', color: 'white'}} />
                <Area type="monotone" dataKey="roi" stroke="#6C63FF" fill="url(#roiGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-6 rounded-2xl" style={{backgroundColor: '#1A1A24', border: '1px solid #2E2E4A'}}>
            <h3 className="text-white font-semibold mb-6">Conversions by Campaign</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={conversionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E2E4A" />
                <XAxis dataKey="name" stroke="#6b7280" tick={{fontSize: 11}} />
                <YAxis stroke="#6b7280" tick={{fontSize: 11}} />
                <Tooltip contentStyle={{backgroundColor: '#1A1A24', border: '1px solid #2E2E4A', borderRadius: '8px', color: 'white'}} />
                <Bar dataKey="conversions" fill="#6C63FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Table */}
        <div className="rounded-2xl overflow-hidden" style={{backgroundColor: '#1A1A24', border: '1px solid #2E2E4A'}}>
          <div className="p-6 border-b" style={{borderColor: '#2E2E4A'}}>
            <h3 className="text-white font-semibold">Campaign Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{backgroundColor: '#24243A'}}>
                  <th className="text-left text-gray-400 text-sm px-6 py-3">Campaign</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-3">Platform</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-3">Spend</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-3">Conversions</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-3">ROI</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((row, i) => (
                  <tr key={i} style={{borderTop: '1px solid #2E2E4A'}}>
                    <td className="px-6 py-4 text-white font-medium text-sm">{row.campaign_name || 'Campaign'}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm capitalize">{row.platform}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm">${(row.acquisition_cost || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{Math.round(row.conversions || 0)}</td>
                    <td className="px-6 py-4 text-sm font-medium" style={{color: (row.roi || 0) > 0 ? '#4ade80' : '#f87171'}}>
                      {((row.roi || 0) * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: row.performance_label === 'High' ? '#14532d33' : row.performance_label === 'Low' ? '#7f1d1d33' : '#78350f33',
                          color: row.performance_label === 'High' ? '#4ade80' : row.performance_label === 'Low' ? '#f87171' : '#fbbf24'
                        }}>
                        {row.performance_label} {row.alert_flag === 1 ? '⚠️' : ''}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}