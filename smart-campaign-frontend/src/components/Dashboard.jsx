import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function Dashboard({ data }) {
  const hasData = data && data.campaigns

  if (!hasData) {
    return (
      <div className="py-24 px-6" style={{ backgroundColor: '#0F0F13' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold mb-3" style={{ color: '#6C63FF' }}>LIVE DASHBOARD</p>
            <h2 className="text-4xl font-bold text-white mb-4">
              Your Campaign <span style={{ color: '#6C63FF' }}>Performance</span>
            </h2>
            <p className="text-gray-400">A real-time overview of all your campaigns across platforms.</p>
          </div>
          <div
            className="flex flex-col items-center justify-center rounded-2xl py-24 px-8 text-center"
            style={{ backgroundColor: '#1A1A24', border: '2px dashed #2E2E4A' }}
          >
            <div className="flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ backgroundColor: '#6C63FF18' }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 4L18 22M18 4L12 10M18 4L24 10" stroke="#6C63FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 26V29C6 30.1046 6.89543 31 8 31H28C29.1046 31 30 30.1046 30 29V26" stroke="#6C63FF" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">No data uploaded yet</h3>
            <p className="text-gray-400 text-sm max-w-sm">
              Upload your campaign data to see your ROI, conversions, and performance breakdown here.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Build KPIs from real data
  const kpis = [
    { label: 'Total Spend', value: `$${data.kpis.total_spend.toLocaleString()}`, change: '', positive: false },
    { label: 'Total Conversions', value: data.kpis.total_conversions.toLocaleString(), change: '', positive: true },
    { label: 'Avg. CTR', value: `${(data.kpis.avg_ctr * 100).toFixed(2)}%`, change: '', positive: true },
    { label: 'Total Revenue', value: `$${data.kpis.total_revenue.toLocaleString()}`, change: '', positive: true },
  ]

  // Build campaign table data from real data
  const campaignData = Object.entries(data.platform_summary).map(([name, ps]) => ({
    name,
    spend: ps.total_spend,
    conversions: Math.round(ps.avg_cvr * 100),
    roi: Math.round(ps.avg_roi * 100),
  }))

  // Build chart data from real campaigns
  const chartData = data.campaigns.map(c => ({
    month: c.campaign_name,
    roi: c.acquisition_cost > 0 ? Math.round(((c.revenue - c.acquisition_cost) / c.acquisition_cost) * 100) : 0,
    conversions: c.conversions || 0,
  }))

  console.log('chartData:', chartData)

  return (
    <div className="py-24 px-6" style={{ backgroundColor: '#0F0F13' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold mb-3" style={{ color: '#6C63FF' }}>LIVE DASHBOARD</p>
          <h2 className="text-4xl font-bold text-white mb-4">
            Your Campaign <span style={{ color: '#6C63FF' }}>Performance</span>
          </h2>
          <p className="text-gray-400">Results from your latest analysis.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, i) => (
            <div key={i} className="p-5 rounded-2xl" style={{ backgroundColor: '#1A1A24', border: '1px solid #2E2E4A' }}>
              <p className="text-gray-400 text-sm mb-2">{kpi.label}</p>
              <p className="text-white text-2xl font-bold mb-1">{kpi.value}</p>
              {kpi.change && (
                <span className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: kpi.positive ? '#14532d33' : '#7f1d1d33',
                    color: kpi.positive ? '#4ade80' : '#f87171'
                  }}>
                  {kpi.change} vs last month
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-2xl" style={{ backgroundColor: '#1A1A24', border: '1px solid #2E2E4A' }}>
            <h3 className="text-white font-semibold mb-6">ROI by Campaign</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E2E4A" />
                <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A24', border: '1px solid #2E2E4A', borderRadius: '8px', color: 'white' }} />
                <Area type="monotone" dataKey="roi" stroke="#6C63FF" fill="url(#roiGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-6 rounded-2xl" style={{ backgroundColor: '#1A1A24', border: '1px solid #2E2E4A' }}>
            <h3 className="text-white font-semibold mb-6">Conversions by Campaign</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E2E4A" />
                <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A24', border: '1px solid #2E2E4A', borderRadius: '8px', color: 'white' }} />
                <Bar dataKey="conversions" fill="#6C63FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Table */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1A1A24', border: '1px solid #2E2E4A' }}>
          <div className="p-6 border-b" style={{ borderColor: '#2E2E4A' }}>
            <h3 className="text-white font-semibold">Campaign Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#24243A' }}>
                  <th className="text-left text-gray-400 text-sm px-6 py-3">Campaign</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-3">Platform</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-3">Spend</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-3">Conversions</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-3">Performance</th>
                </tr>
              </thead>
              <tbody>
                {data.campaigns.map((c, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #2E2E4A' }}>
                    <td className="px-6 py-4 text-white font-medium">{c.campaign_name}</td>
                    <td className="px-6 py-4 text-gray-300">{c.platform}</td>
                    <td className="px-6 py-4 text-gray-300">${(c.acquisition_cost || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-300">{c.conversions}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: c.performance_label === 'High' ? '#14532d33' : c.performance_label === 'Low' ? '#7f1d1d33' : '#78350f33',
                          color: c.performance_label === 'High' ? '#4ade80' : c.performance_label === 'Low' ? '#f87171' : '#fbbf24'
                        }}>
                        {c.performance_label}
                        {c.alert_flag === 1 ? ' ⚠️' : ''}
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