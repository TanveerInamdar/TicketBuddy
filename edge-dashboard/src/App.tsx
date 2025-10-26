import { useAuth0 } from '@auth0/auth0-react'
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import TicketBoard from './pages/TicketBoard'
import TicketSubmission from './pages/TicketSubmission'

function App() {
  const { isLoading, error, loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Oops... {error.message}</h2>
          <p className="text-slate-300">There was an error loading the application.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Animated Space Background */}
        <div className="space-background w-full h-screen absolute inset-0 -z-10 animate-space-travel opacity-30"></div>
        
        {/* Floating Space Cowboy */}
        <div className="absolute top-20 left-10 z-0">
          <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-float shadow-2xl">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        </div>

        {/* Orbiting Elements */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-blue-400 rounded-full animate-orbit"></div>
        </div>
        
        {/* Enhanced Background Stars */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-blue-300 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-40 left-1/4 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-500"></div>
          <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-cyan-300 rounded-full animate-pulse delay-700"></div>
          <div className="absolute bottom-40 left-20 w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-200"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-pink-300 rounded-full animate-pulse delay-800"></div>
        </div>
        
        {/* Main Login Card with Enhanced Effects */}
        <div className="relative z-10 bg-slate-800/95 backdrop-blur-md border border-purple-500/50 rounded-3xl p-10 w-full max-w-lg shadow-2xl animate-pulse-glow">
          {/* Header with Shimmer Effect */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-full mb-6 animate-pulse-glow">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold shimmer-text mb-3 animate-shimmer">
              TicketBuddy
            </h1>
            <p className="text-slate-400 text-lg font-semibold">Space Cowboy Edition</p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-2 rounded-full"></div>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              Welcome, Space Ranger
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Access the galactic ticket management system and embark on your cosmic journey through the stars. 
              Your adventure awaits in the digital frontier.
            </p>
          </div>

          {/* Enhanced Login Button */}
          <button
            onClick={() => loginWithRedirect()}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center space-x-3 text-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Launch into Auth0</span>
            <svg className="w-6 h-6 animate-bounce delay-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-slate-500">
              Powered by cosmic authentication technology
            </p>
            <div className="flex justify-center space-x-2 mt-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200"></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-400"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Decorative Elements */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-20 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping delay-700"></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-purple-300 rounded-full animate-ping delay-1000"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-blue-400">TicketBuddy</h1>
              <div className="flex items-center gap-6">
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
                </nav>
                
                {/* Auth Section */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <img 
                      src={user?.picture} 
                      alt={user?.name} 
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-slate-300">{user?.name}</span>
                  </div>
                  <button
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<TicketSubmission />} />
            <Route 
              path="/board" 
              element={
                <ProtectedRoute>
                  <TicketBoard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

