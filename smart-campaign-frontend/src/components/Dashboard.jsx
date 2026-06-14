import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, ScatterChart, Scatter, ZAxis } from 'recharts'

export default function Dashboard({ analysisData }) {

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

  // Check available data
  const hasAudience = campaigns.some(c => c.target_audience && c.target_audience !== 0)
  const hasVideoViews = campaigns.some(c => c.video_views && c.video_views > 0)
  const hasDate = campaigns.some(c => c.month && c.month !== 0)
  const platforms = [...new Set(campaigns.map(c => c.platform))]
  const isMultiPlatform = platforms.length > 1
  const alertCount = campaigns.filter(c => c.alert_flag === 1).length
  const highCount = campaigns.filter(c => c.performance_label === 'High').length
  const mediumCount = campaigns.filter(c => c.performance_label === 'Medium').length
  const lowCount = campaigns.filter(c => c.performance_label === 'Low').length

  // Chart data
  const roiChartData = campaigns.map(c => ({
    name: c.campaign_name?.substring(0, 12) || 'Campaign',
    roi: parseFloat(((c.roi || 0) * 100).toFixed(1))
  }))

  const conversionChartData = campaigns.map(c => ({
    name: c.campaign_name?.substring(0, 12) || 'Campaign',
    conversions: Math.round(c.conversions || 0)
  }))

  // Platform comparison data
  const platformData = platforms.map(p => {
    const platformCampaigns = campaigns.filter(c => c.platform === p)
    return {
      name: p.charAt(0).toUpperCase() + p.slice(1),
      roi: parseFloat((platformCampaigns.reduce((sum, c) => sum + (c.roi || 0), 0) / platformCampaigns.length * 100).toFixed(1)),
      conversions: Math.round(platformCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0)),
      spend: Math.round(platformCampaigns.reduce((sum, c) => sum + (c.acquisition_cost || 0), 0)),
    }
  }).sort((a, b) => b.roi - a.roi)

  // Audience data
  const audienceMap = {}
  campaigns.forEach(c => {
    if (c.target_audience) {
      const key = String(c.target_audience)
      if (!audienceMap[key]) audienceMap[key] = { conversions: 0, spend: 0, count: 0 }
      audienceMap[key].conversions += c.conversions || 0
      audienceMap[key].spend += c.acquisition_cost || 0
      audienceMap[key].count++
    }
  })
  const audienceData = Object.entries(audienceMap).map(([audience, data]) => ({
    audience: audience.substring(0, 15),
    conversions: Math.round(data.conversions),
    cpa: data.spend > 0 ? Math.round(data.spend / data.conversions) : 0
  }))

  // Video data
  const videoData = campaigns.filter(c => c.video_views > 0).map(c => ({
    name: c.campaign_name?.substring(0, 12) || 'Campaign',
    views: Math.round(c.video_views || 0),
    rate: parseFloat(((c.video_view_rate || 0) * 100).toFixed(1))
  }))

  // Trend data
  const trendData = [...campaigns].sort((a, b) => (a.month || 0) - (b.month || 0)).map(c => ({
    name: c.campaign_name?.substring(0, 10) || 'Campaign',
    roi: parseFloat(((c.roi || 0) * 100).toFixed(1)),
    ctr: parseFloat(((c.ctr || 0) * 100).toFixed(2)),
  }))

  const tooltipStyle = { backgroundColor: '#1A1A24', border: '1px solid #2E2E4A', borderRadius: '8px', color: 'white' }

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

        {/* SECTION 1 — KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Spend', value: `$${(kpis.total_spend || 0).toLocaleString()}` },
            { label: 'Total Conversions', value: (kpis.total_conversions || 0).toLocaleString() },
            { label: 'Total Revenue', value: `$${(kpis.total_revenue || 0).toLocaleString()}` },
            { label: 'Avg. ROI', value: `${kpis.avg_roi || 0}%` },
            { label: 'Avg. CTR', value: `${((kpis.avg_ctr || 0)).toFixed(2)}%` },
            { label: 'Alerts', value: alertCount, alert: alertCount > 0 },
          ].map((kpi, i) => (
            <div key={i} className="p-4 rounded-2xl" style={{backgroundColor: '#1A1A24', border: `1px solid ${kpi.alert ? '#f87171' : '#2E2E4A'}`}}>
              <p className="text-gray-400 text-xs mb-2">{kpi.label}</p>
              <p className="text-white text-xl font-bold" style={{color: kpi.alert ? '#f87171' : 'white'}}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'High Performing', value: highCount, color: '#4ade80', bg: '#14532d33' },
            { label: 'Medium Performing', value: mediumCount, color: '#fbbf24', bg: '#78350f33' },
            { label: 'Low Performing', value: lowCount, color: '#f87171', bg: '#7f1d1d33' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl text-center" style={{backgroundColor: item.bg, border: `1px solid ${item.color}33`}}>
              <p className="text-2xl font-bold mb-1" style={{color: item.color}}>{item.value}</p>
              <p className="text-gray-400 text-sm">{item.label}</p>
            </div>
          ))}
        </div>

        {/* SECTION 3 — Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-2xl" style={{backgroundColor: '#1A1A24', border: '1px solid #2E2E4A'}}>
            <h3 className="text-white font-semibold mb-6">ROI by Campaign</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={roiChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E2E4A" />
                <XAxis dataKey="name" stroke="#6b7280" tick={{fontSize: 11}} />
                <YAxis stroke="#6b7280" tick={{fontSize: 11}} unit="%" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'ROI']} />
                <Bar dataKey="roi" fill="#6C63FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-6 rounded-2xl" style={{backgroundColor: '#1A1A24', border: '1px solid #2E2E4A'}}>
            <h3 className="text-white font-semibold mb-6">Conversions by Campaign</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={conversionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E2E4A" />
                <XAxis dataKey="name" stroke="#6b7280" tick={{fontSize: 11}} />
                <YAxis stroke="#6b7280" tick={{fontSize: 11}} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="conversions" fill="#4ade80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECTION 2 — Campaign Table */}
        <div className="rounded-2xl overflow-hidden mb-8" style={{backgroundColor: '#1A1A24', border: '1px solid #2E2E4A'}}>
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
                  <th className="text-left text-gray-400 text-sm px-6 py-3">CTR</th>
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
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {((row.ctr || 0) * 100).toFixed(2)}%
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

        {/* SECTION 4 — Cross-Platform (only if 2+ platforms) */}
        {isMultiPlatform && (
          <div className="mb-8">
            <h3 className="text-white font-bold text-xl mb-6">Cross-Platform Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl" style={{backgroundColor: '#1A1A24', border: '1px solid #2E2E4A'}}>
                <h4 className="text-white font-semibold mb-4">ROI by Platform</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2E2E4A" />
                    <XAxis dataKey="name" stroke="#6b7280" tick={{fontSize: 11}} />
                    <YAxis stroke="#6b7280" tick={{fontSize: 11}} unit="%" />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'ROI']} />
                    <Bar dataKey="roi" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-6 rounded-2xl" style={{backgroundColor: '#1A1A24', border: '1px solid #2E2E4A'}}>
                <h4 className="text-white font-semibold mb-4">Platform Rankings</h4>
                <div className="flex flex-col gap-3">
                  {platformData.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                      style={{backgroundColor: '#24243A'}}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold" style={{color: i === 0 ? '#4ade80' : i === platformData.length - 1 ? '#f87171' : '#fbbf24'}}>
                          #{i + 1}
                        </span>
                        <span className="text-white font-medium">{p.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{p.roi}% ROI</p>
                        <p className="text-gray-400 text-xs">{p.conversions} conversions</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-xl" style={{backgroundColor: '#14532d33', border: '1px solid #4ade8033'}}>
                  <p className="text-green-400 text-sm font-medium">
                    🏆 Best platform: {platformData[0]?.name} at {platformData[0]?.roi}% ROI
                  </p>
                </div>
                {platformData.length > 1 && (
                  <div className="mt-2 p-3 rounded-xl" style={{backgroundColor: '#7f1d1d33', border: '1px solid #f8717133'}}>
                    <p className="text-red-400 text-sm font-medium">
                      ⚠️ Reduce spend on: {platformData[platformData.length - 1]?.name} at {platformData[platformData.length - 1]?.roi}% ROI
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5 — Audience Insights */}
        {hasAudience && audienceData.length > 0 && (
          <div className="mb-8">
            <h3 className="text-white font-bold text-xl mb-6">Audience Insights</h3>
            <div className="p-6 rounded-2xl" style={{backgroundColor: '#1A1A24', border: '1px solid #2E2E4A'}}>
              <h4 className="text-white font-semibold mb-4">Conversions by Audience Segment</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={audienceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2E2E4A" />
                  <XAxis dataKey="audience" stroke="#6b7280" tick={{fontSize: 11}} />
                  <YAxis stroke="#6b7280" tick={{fontSize: 11}} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="conversions" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* SECTION 6 — Video Performance */}
        {hasVideoViews && videoData.length > 0 && (
          <div className="mb-8">
            <h3 className="text-white font-bold text-xl mb-6">Video Performance</h3>
            <div className="p-6 rounded-2xl" style={{backgroundColor: '#1A1A24', border: '1px solid #2E2E4A'}}>
              <h4 className="text-white font-semibold mb-4">Video Views by Campaign</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={videoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2E2E4A" />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{fontSize: 11}} />
                  <YAxis stroke="#6b7280" tick={{fontSize: 11}} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="views" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* SECTION 7 — Performance Trends */}
        {hasDate && trendData.length > 1 && (
          <div className="mb-8">
            <h3 className="text-white font-bold text-xl mb-6">Performance Trends</h3>
            <div className="p-6 rounded-2xl" style={{backgroundColor: '#1A1A24', border: '1px solid #2E2E4A'}}>
              <h4 className="text-white font-semibold mb-4">ROI Trend Across Campaigns</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2E2E4A" />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{fontSize: 11}} />
                  <YAxis stroke="#6b7280" tick={{fontSize: 11}} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'ROI']} />
                  <Line type="monotone" dataKey="roi" stroke="#6C63FF" strokeWidth={2} dot={{fill: '#6C63FF'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}