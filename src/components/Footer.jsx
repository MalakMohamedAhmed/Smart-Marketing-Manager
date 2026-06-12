export default function Footer() {
  return (
    <footer className="py-12 px-6" style={{backgroundColor: '#0F0F13', borderTop: '1px solid #2E2E4A'}}>
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div style={{backgroundColor: '#6C63FF'}} className="w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <span className="text-white font-bold text-xl">SmartCampaign</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white text-sm transition-colors">Features</a>
            <a href="#upload" className="text-gray-400 hover:text-white text-sm transition-colors">Analyze</a>
            <a href="#dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">Dashboard</a>
            <a href="#recommendations" className="text-gray-400 hover:text-white text-sm transition-colors">Recommendations</a>
          </div>

          {/* Copyright */}
          <p className="text-gray-500 text-sm">© 2026 SmartCampaign. All rights reserved.</p>

        </div>

      </div>
    </footer>
  )
}