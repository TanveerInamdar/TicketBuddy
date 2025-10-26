import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import TicketSubmission from './pages/TicketSubmission'
import TicketBoard from './pages/TicketBoard'
import GitHubIntegration from './pages/GitHubIntegration'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-blue-400">TicketBuddy</h1>
              <nav className="flex gap-6">
                <Link 
                  to="/" 
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Submit Request
                </Link>
                <Link 
                  to="/board" 
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Ticket Board
                </Link>
                <Link 
                  to="/github" 
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  GitHub
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<TicketSubmission />} />
            <Route path="/board" element={<TicketBoard />} />
            <Route path="/github" element={<GitHubIntegration />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

