import { useState } from 'react'
import { FiUploadCloud, FiX, FiCheck, FiArrowRight, FiArrowLeft, FiAlertCircle, FiInfo } from 'react-icons/fi'
import { useAnalyses } from '../hooks/useAnalyses'
import { useAuth } from '../context/AuthContext'

const platforms = ["Facebook", "Google", "Instagram", "TikTok", "YouTube", "Twitter", "Pinterest", "WhatsApp", "Email"]

const objectives = ["Brand Awareness", "Lead Generation", "Conversions / Sales", "Traffic / Website Visits", "App Installs", "Engagement"]

const platformMappings = {
  Facebook: { 'Campaign Name': 'campaign_name', 'Amount Spent': 'spend', 'Impressions': 'impressions', 'Clicks': 'clicks', 'Conversions': 'conversions', 'Reach': 'reach', 'Frequency': 'frequency', 'CPM': 'cpm', 'CTR': 'ctr', 'CPC': 'cpc', 'Date': 'date', 'Budget': 'budget' },
  Google: { 'Campaign': 'campaign_name', 'Cost': 'spend', 'Impressions': 'impressions', 'Clicks': 'clicks', 'Conversions': 'conversions', 'CTR': 'ctr', 'Avg. CPC': 'cpc', 'Date': 'date', 'Budget': 'budget' },
  TikTok: { 'Campaign name': 'campaign_name', 'Cost': 'spend', 'Impressions': 'impressions', 'Clicks': 'clicks', 'Conversions': 'conversions', 'Video views': 'video_views', 'CTR': 'ctr', 'CPC': 'cpc', 'Date': 'date' },
  Instagram: { 'Campaign Name': 'campaign_name', 'Amount Spent': 'spend', 'Impressions': 'impressions', 'Clicks': 'clicks', 'Conversions': 'conversions', 'Reach': 'reach', 'CTR': 'ctr', 'Date': 'date' },
  default: { 'campaign_name': 'campaign_name', 'spend': 'spend', 'impressions': 'impressions', 'clicks': 'clicks', 'conversions': 'conversions', 'ctr': 'ctr', 'cpc': 'cpc', 'date': 'date', 'budget': 'budget' }
}

const TIER1 = ['impressions', 'clicks', 'spend', 'conversions']
const TIER2 = [...TIER1, 'date', 'budget', 'ctr']
const TIER3 = [...TIER2, 'video_views', 'reach', 'frequency', 'cpm']

function detectTier(mappedColumns) {
  const cols = mappedColumns.map(c => c.toLowerCase())
  if (TIER3.every(f => cols.includes(f))) return 3
  if (TIER2.every(f => cols.includes(f))) return 2
  if (TIER1.every(f => cols.includes(f))) return 1
  return 0
}

function parseCSVHeaders(text) {
  const firstLine = text.split('\n')[0]
  return firstLine.split(',').map(h => h.trim().replace(/"/g, ''))
}

function mapColumns(headers, platform) {
  const mapping = platformMappings[platform] || platformMappings.default
  return headers.map(h => mapping[h] || h)
}

const tierConfig = {
  0: { label: 'Below Minimum', color: '#f87171', bg: '#7f1d1d33', desc: 'Missing critical columns. Cannot run analysis.' },
  1: { label: 'Tier 1 — Low Confidence', color: '#fbbf24', bg: '#78350f33', desc: 'Minimum viable data. Basic analysis only.' },
  2: { label: 'Tier 2 — Full Confidence', color: '#4ade80', bg: '#14532d33', desc: 'Standard data. Full analysis available.' },
  3: { label: 'Tier 3 — Rich Insights', color: '#6C63FF', bg: '#6C63FF22', desc: 'Complete data. Maximum recommendations.' },
}

export default function Upload({ onAnalysisComplete }) {
  const [step, setStep] = useState(1)
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [fileMode, setFileMode] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState({})
  const [fileValidation, setFileValidation] = useState({})
  const [selectedObjective, setSelectedObjective] = useState('')
  const [dragOver, setDragOver] = useState(null)
  const [combinedPlatformColumn, setCombinedPlatformColumn] = useState('')
  const { saveAnalysis } = useAnalyses()
  const { currentUser } = useAuth()

  const togglePlatform = (p) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  const handleFileUpload = async (platform, file) => {
    if (!file || !file.name.endsWith('.csv')) return
    const text = await file.text()
    const headers = parseCSVHeaders(text)
    const mapped = mapColumns(headers, platform)
    const tier = detectTier(mapped)
    const missingTier1 = TIER1.filter(f => !mapped.map(c => c.toLowerCase()).includes(f))
    const rows = text.split('\n').filter(r => r.trim()).length - 1
    setUploadedFiles(prev => ({ ...prev, [platform]: { name: file.name, headers, mapped, rows, file } }))
    setFileValidation(prev => ({ ...prev, [platform]: { tier, missingTier1, headers, mapped } }))
  }

  const removeFile = (platform) => {
    setUploadedFiles(prev => { const u = { ...prev }; delete u[platform]; return u })
    setFileValidation(prev => { const u = { ...prev }; delete u[platform]; return u })
  }

  const canProceedStep1 = selectedPlatforms.length > 0
  const canProceedStep2 = fileMode !== null
  const canProceedStep3 = selectedPlatforms.every(p => uploadedFiles[p]) &&
    selectedPlatforms.every(p => fileValidation[p]?.tier >= 1)
  const canRunAnalysis = canProceedStep3 && selectedObjective !== ''

  return (
    <div className="py-24 px-6" style={{ backgroundColor: '#1A1A24' }}>
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-sm font-semibold mb-3" style={{ color: '#6C63FF' }}>GET STARTED</p>
          <h2 className="text-4xl font-bold text-white mb-4">Analyze Your Campaigns</h2>
          <p className="text-gray-400">Follow the steps below to get AI-powered insights.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {['Platforms', 'File Setup', 'Upload', 'Validate', 'Confirm'].map((label, i) => {
            const stepNum = i + 1
            const active = step === stepNum
            const done = step > stepNum
            return (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                    style={{
                      backgroundColor: done ? '#6C63FF' : active ? '#6C63FF' : '#24243A',
                      color: done || active ? 'white' : '#6b7280',
                      border: active ? '2px solid #9d97ff' : 'none'
                    }}>
                    {done ? '✓' : stepNum}
                  </div>
                  <span className="text-xs mt-1 hidden md:block"
                    style={{ color: active ? '#6C63FF' : done ? '#9d97ff' : '#6b7280' }}>
                    {label}
                  </span>
                </div>
                {i < 4 && <div className="w-8 h-px mb-4" style={{ backgroundColor: step > stepNum ? '#6C63FF' : '#2E2E4A' }} />}
              </div>
            )
          })}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="p-8 rounded-2xl" style={{ backgroundColor: '#0F0F13', border: '1px solid #2E2E4A' }}>
            <h3 className="text-white font-bold text-xl mb-2">Which platforms did you run campaigns on?</h3>
            <p className="text-gray-400 text-sm mb-6">Select one or more platforms to analyze.</p>
            <div className="flex flex-wrap gap-3 mb-8">
              {platforms.map(p => (
                <button key={p} onClick={() => togglePlatform(p)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: selectedPlatforms.includes(p) ? '#6C63FF' : '#24243A',
                    color: selectedPlatforms.includes(p) ? 'white' : '#9ca3af',
                    border: `1px solid ${selectedPlatforms.includes(p) ? '#6C63FF' : '#2E2E4A'}`
                  }}>
                  {p}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setStep(selectedPlatforms.length === 1 ? 3 : 2)}
                disabled={!canProceedStep1}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
                style={{
                  backgroundColor: canProceedStep1 ? '#6C63FF' : '#24243A',
                  color: canProceedStep1 ? 'white' : '#6b7280',
                  cursor: canProceedStep1 ? 'pointer' : 'not-allowed'
                }}>
                Next <FiArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="p-8 rounded-2xl" style={{ backgroundColor: '#0F0F13', border: '1px solid #2E2E4A' }}>
            <h3 className="text-white font-bold text-xl mb-2">How is your data organized?</h3>
            <p className="text-gray-400 text-sm mb-6">Tell us how your campaign files are structured.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                { value: 'separate', title: 'One file per platform', desc: 'I have a separate CSV for each platform I selected.' },
                { value: 'combined', title: 'One file for all platforms', desc: 'I have a single CSV that contains data from all platforms.' }
              ].map(opt => (
                <button key={opt.value} onClick={() => setFileMode(opt.value)}
                  className="p-6 rounded-xl text-left transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: fileMode === opt.value ? '#24243A' : '#1A1A24',
                    border: `2px solid ${fileMode === opt.value ? '#6C63FF' : '#2E2E4A'}`
                  }}>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0"
                      style={{ borderColor: fileMode === opt.value ? '#6C63FF' : '#6b7280' }}>
                      {fileMode === opt.value && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#6C63FF' }} />}
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">{opt.title}</p>
                      <p className="text-gray-400 text-sm">{opt.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-colors">
                <FiArrowLeft /> Back
              </button>
              <button onClick={() => setStep(3)} disabled={!canProceedStep2}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
                style={{
                  backgroundColor: canProceedStep2 ? '#6C63FF' : '#24243A',
                  color: canProceedStep2 ? 'white' : '#6b7280',
                  cursor: canProceedStep2 ? 'pointer' : 'not-allowed'
                }}>
                Next <FiArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="p-8 rounded-2xl" style={{ backgroundColor: '#0F0F13', border: '1px solid #2E2E4A' }}>
            <h3 className="text-white font-bold text-xl mb-2">Upload Your CSV Files</h3>
            <p className="text-gray-400 text-sm mb-6">
              {fileMode === 'combined' || selectedPlatforms.length === 1
                ? 'Upload your campaign data file.'
                : 'Upload one CSV file for each selected platform.'}
            </p>

            {fileMode === 'combined' ? (
              <div className="mb-6">
                {uploadedFiles['combined'] ? (
                  <div className="p-4 rounded-xl flex items-center justify-between"
                    style={{ backgroundColor: '#24243A', border: '1px solid #6C63FF' }}>
                    <div className="flex items-center gap-3">
                      <FiCheck className="text-green-400" size={18} />
                      <div>
                        <p className="text-white text-sm font-medium">{uploadedFiles['combined'].name}</p>
                        <p className="text-gray-400 text-xs">{uploadedFiles['combined'].rows} rows detected</p>
                      </div>
                    </div>
                    <button onClick={() => removeFile('combined')}><FiX className="text-gray-400 hover:text-red-400" /></button>
                  </div>
                ) : (
                  <label className="block p-8 rounded-xl text-center cursor-pointer transition-all"
                    style={{ border: `2px dashed ${dragOver === 'combined' ? '#6C63FF' : '#2E2E4A'}`, backgroundColor: dragOver === 'combined' ? '#24243A' : '#1A1A24' }}
                    onDragOver={e => { e.preventDefault(); setDragOver('combined') }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={e => { e.preventDefault(); setDragOver(null); handleFileUpload('combined', e.dataTransfer.files[0]) }}>
                    <input type="file" accept=".csv" className="hidden" onChange={e => handleFileUpload('combined', e.target.files[0])} />
                    <FiUploadCloud className="mx-auto mb-3 text-gray-500" size={32} />
                    <p className="text-gray-300 font-medium">Drop your CSV here or click to browse</p>
                    <p className="text-gray-500 text-sm mt-1">Combined data from all platforms</p>
                  </label>
                )}
                {uploadedFiles['combined'] && (
                  <div className="mt-4">
                    <label className="block text-gray-400 text-sm mb-2">Which column identifies the platform?</label>
                    <select value={combinedPlatformColumn}
                      onChange={e => setCombinedPlatformColumn(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-white outline-none"
                      style={{ backgroundColor: '#24243A', border: '1px solid #2E2E4A' }}>
                      <option value="">Select column...</option>
                      {uploadedFiles['combined']?.headers?.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {selectedPlatforms.map(platform => (
                  <div key={platform}>
                    {uploadedFiles[platform] ? (
                      <div className="p-4 rounded-xl flex items-center justify-between"
                        style={{ backgroundColor: '#24243A', border: '1px solid #6C63FF' }}>
                        <div className="flex items-center gap-3">
                          <FiCheck className="text-green-400" size={18} />
                          <div>
                            <p className="text-white text-sm font-medium">{platform}</p>
                            <p className="text-gray-400 text-xs">{uploadedFiles[platform].name} · {uploadedFiles[platform].rows} rows</p>
                          </div>
                        </div>
                        <button onClick={() => removeFile(platform)}><FiX className="text-gray-400 hover:text-red-400" /></button>
                      </div>
                    ) : (
                      <label className="block p-4 rounded-xl text-center cursor-pointer transition-all"
                        style={{ border: `2px dashed ${dragOver === platform ? '#6C63FF' : '#2E2E4A'}`, backgroundColor: dragOver === platform ? '#24243A' : '#1A1A24' }}
                        onDragOver={e => { e.preventDefault(); setDragOver(platform) }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={e => { e.preventDefault(); setDragOver(null); handleFileUpload(platform, e.dataTransfer.files[0]) }}>
                        <input type="file" accept=".csv" className="hidden" onChange={e => handleFileUpload(platform, e.target.files[0])} />
                        <FiUploadCloud className="mx-auto mb-2 text-gray-500" size={24} />
                        <p className="text-gray-400 text-sm font-medium">{platform}</p>
                        <p className="text-gray-600 text-xs mt-1">Drop CSV or click to browse</p>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(selectedPlatforms.length === 1 ? 1 : 2)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-colors">
                <FiArrowLeft /> Back
              </button>
              <button onClick={() => setStep(4)} disabled={!canProceedStep3}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
                style={{
                  backgroundColor: canProceedStep3 ? '#6C63FF' : '#24243A',
                  color: canProceedStep3 ? 'white' : '#6b7280',
                  cursor: canProceedStep3 ? 'pointer' : 'not-allowed'
                }}>
                Validate Files <FiArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="p-8 rounded-2xl" style={{ backgroundColor: '#0F0F13', border: '1px solid #2E2E4A' }}>
            <h3 className="text-white font-bold text-xl mb-2">File Validation</h3>
            <p className="text-gray-400 text-sm mb-6">Here's what we found in your uploaded files.</p>

            <div className="flex flex-col gap-4 mb-8">
              {selectedPlatforms.map(platform => {
                const val = fileValidation[platform]
                const file = uploadedFiles[platform]
                if (!val) return null
                const tc = tierConfig[val.tier]
                return (
                  <div key={platform} className="p-6 rounded-xl" style={{ backgroundColor: '#1A1A24', border: '1px solid #2E2E4A' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <p className="text-white font-semibold">{platform}</p>
                        <span className="text-xs px-2 py-1 text-gray-400">{file.name}</span>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ backgroundColor: tc.bg, color: tc.color }}>
                        {tc.label}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{tc.desc}</p>
                    {val.tier === 0 && (
                      <div className="flex items-start gap-2 p-3 rounded-lg mb-3"
                        style={{ backgroundColor: '#7f1d1d33', border: '1px solid #f8717133' }}>
                        <FiAlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                        <p className="text-red-400 text-sm">
                          Missing critical columns: <strong>{val.missingTier1.join(', ')}</strong>
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {val.mapped.map((col, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: TIER1.includes(col) ? '#14532d33' : '#24243A',
                            color: TIER1.includes(col) ? '#4ade80' : '#9ca3af'
                          }}>
                          {col}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-500 text-xs mt-3">{file.rows} rows · {val.mapped.length} columns detected</p>
                  </div>
                )
              })}
            </div>

            <div className="mb-8">
              <h4 className="text-white font-semibold mb-3">Campaign Objective</h4>
              <div className="flex flex-wrap gap-3">
                {objectives.map(obj => (
                  <button key={obj} onClick={() => setSelectedObjective(obj)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      backgroundColor: selectedObjective === obj ? '#6C63FF' : '#24243A',
                      color: selectedObjective === obj ? 'white' : '#9ca3af',
                      border: `1px solid ${selectedObjective === obj ? '#6C63FF' : '#2E2E4A'}`
                    }}>
                    {obj}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(3)} className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-colors">
                <FiArrowLeft /> Back
              </button>
              <button onClick={() => setStep(5)} disabled={!canRunAnalysis}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
                style={{
                  backgroundColor: canRunAnalysis ? '#6C63FF' : '#24243A',
                  color: canRunAnalysis ? 'white' : '#6b7280',
                  cursor: canRunAnalysis ? 'pointer' : 'not-allowed'
                }}>
                Review & Confirm <FiArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div className="p-8 rounded-2xl" style={{ backgroundColor: '#0F0F13', border: '1px solid #2E2E4A' }}>
            <h3 className="text-white font-bold text-xl mb-2">Ready to Analyze</h3>
            <p className="text-gray-400 text-sm mb-6">Here's a summary of what will be analyzed.</p>

            <div className="flex flex-col gap-3 mb-8">
              {selectedPlatforms.map(platform => {
                const val = fileValidation[platform]
                const file = uploadedFiles[platform]
                const tc = tierConfig[val?.tier || 0]
                return (
                  <div key={platform} className="flex items-center justify-between p-4 rounded-xl"
                    style={{ backgroundColor: '#1A1A24', border: '1px solid #2E2E4A' }}>
                    <div className="flex items-center gap-3">
                      <FiCheck className="text-green-400" size={18} />
                      <div>
                        <p className="text-white font-medium">{platform}</p>
                        <p className="text-gray-400 text-xs">{file?.name} · {file?.rows} rows · {val?.mapped?.length} features</p>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ backgroundColor: tc.bg, color: tc.color }}>
                      {tc.label}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="p-4 rounded-xl mb-8 flex items-center gap-3"
              style={{ backgroundColor: '#24243A', border: '1px solid #2E2E4A' }}>
              <FiInfo className="text-gray-400 flex-shrink-0" size={18} />
              <div>
                <p className="text-white text-sm font-medium">Objective: {selectedObjective}</p>
                <p className="text-gray-400 text-xs mt-0.5">Recommendations will be tailored to this goal</p>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(4)} className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-colors">
                <FiArrowLeft /> Back
              </button>
              <button
                onClick={async () => {
                try {
                  const formData = new FormData()
                  selectedPlatforms.forEach(p => formData.append('platforms', p))
                  formData.append('file_mode', 'one_per_platform')

                  formData.append('objective', selectedObjective)

                  
                  // 1. Send the platform metadata lists
                  selectedPlatforms.forEach(p => formData.append('platforms', p))
                  formData.append('file_mode', 'one_per_platform')
                  formData.append('objective', selectedObjective) // Sends your tracking goal to the backend

                  // 2. Safely attach your actual CSV file streams
                  selectedPlatforms.forEach(p => {
                    if (uploadedFiles[p] && uploadedFiles[p].file) {
                      formData.append(`file_${p.toLowerCase()}`, uploadedFiles[p].file) // ✅ Fixed: uploadedFiles[p].file
                    }
                  })

                  const res = await fetch('https://smart-marketing-manager-production.up.railway.app/analyze', {
                    method: 'POST',
                    body: formData
                  })
                  const result = await res.json()
                  onAnalysisComplete(result)

                  if (currentUser) {
                    await saveAnalysis({
                      platforms: selectedPlatforms,
                      objective: selectedObjective,
                      filesSummary: selectedPlatforms.map(p => ({
                        platform: p,
                        rows: uploadedFiles[p]?.rows || 0,
                        tier: fileValidation[p]?.tier || 0
                      }))
                    })
                  }
                  window.location.href = '#dashboard'
                } catch (err) {
                  console.error('Analysis failed:', err)
                }
              }}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-lg transition-all hover:opacity-90 hover:scale-105"
                style={{ backgroundColor: '#6C63FF' }}>
                🚀 Run Analysis
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}