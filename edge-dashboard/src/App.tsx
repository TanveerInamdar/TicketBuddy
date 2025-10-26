import { useAuth0 } from '@auth0/auth0-react'
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import TicketBoard from './pages/TicketBoard'
import TicketSubmission from './pages/TicketSubmission'
import robotCowboy from './image.png'

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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent"></div>
        
        {/* Scanning Lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-scan-line"></div>
          <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent animate-scan-line-delayed"></div>
        </div>
        
        {/* Floating Code Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute text-cyan-400/30 font-mono text-xs animate-float-code"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            >
              {['01010', '11001', '10110', 'AUTH', 'BOOT', 'SYNC'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
        
        {/* Shooting Stars - More Realistic */}
        <div className="absolute top-10 left-0 w-2 h-0.5 bg-gradient-to-r from-white to-transparent animate-shooting-star-fast"></div>
        <div className="absolute top-40 left-0 w-2 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent animate-shooting-star-delayed"></div>
        <div className="absolute top-60 left-0 w-2 h-0.5 bg-gradient-to-r from-purple-400 to-transparent animate-shooting-star-delayed-2"></div>
        
        {/* Holographic Planets */}
        <div className="absolute top-20 right-20 animate-float-slow">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-sm border border-purple-400/30 relative">
            <div className="absolute inset-0 rounded-full animate-pulse-ring"></div>
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent transform -rotate-12"></div>
          </div>
        </div>
        
        <div className="absolute bottom-32 left-20 animate-float-slower">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-600/30 to-blue-600/30 backdrop-blur-sm border border-cyan-400/30 relative">
            <div className="absolute inset-0 rounded-full animate-pulse-ring-delayed"></div>
          </div>
        </div>

        {/* Glitch Stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-glitch-star"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            ></div>
          ))}
        </div>
        
        {/* Main Login Card */}
        <div className="relative z-10 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-10 w-full max-w-lg shadow-2xl shadow-purple-900/50">
          {/* Glowing Border Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 animate-border-glow"></div>
          <div className="absolute inset-[1px] rounded-2xl bg-slate-900/95"></div>
          
          <div className="relative z-10">
            {/* Header with Robot Cowboy */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center mb-6 relative">
                {/* Robot Cowboy Image */}
                <div className="relative w-32 h-32 animate-hover-float">
                  <img 
                    src={robotCowboy}
                    alt="Space Cowboy"
                    className="w-full h-full object-cover rounded-full border-4 border-cyan-500/30 p-2 bg-slate-800/50 drop-shadow-2xl"
                  />
                  {/* Hover Thrusters */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
                    <div className="w-2 h-6 bg-gradient-to-t from-cyan-400 to-transparent animate-thruster-left"></div>
                    <div className="w-2 h-6 bg-gradient-to-t from-cyan-400 to-transparent animate-thruster-right"></div>
                  </div>
                  {/* Scanning Ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400/0 animate-scan-ring"></div>
                </div>
              </div>
              
              <h1 className="text-5xl font-bold mb-3 tracking-wider">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-gradient-text">
                  TICKETBUDDY
                </span>
              </h1>
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-400"></div>
                <p className="text-cyan-400/80 text-sm font-mono tracking-widest uppercase">
                  Space Cowboy Protocol
                </p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-400"></div>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-purple-400/60">
                <span className="animate-pulse">●</span>
                <span>SYSTEM ONLINE</span>
                <span className="animate-pulse animation-delay-500">●</span>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="text-center mb-10 space-y-4">
              <h2 className="text-2xl font-bold text-white">
                Authentication Required
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                Access the galactic ticket management system. 
                Secure authentication via Auth0 protocol.
              </p>
            </div>

            {/* Enhanced Login Button */}
            <button
              onClick={() => loginWithRedirect()}
              className="w-full bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-500 hover:via-purple-500 hover:to-pink-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/50 flex items-center justify-center space-x-3 text-base relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="tracking-wide">INITIALIZE AUTH SEQUENCE</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            {/* System Info Footer */}
            <div className="text-center mt-8 space-y-3">
              <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>SECURE</span>
                </div>
                <div className="w-px h-3 bg-slate-700"></div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-300"></div>
                  <span>ENCRYPTED</span>
                </div>
                <div className="w-px h-3 bg-slate-700"></div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-600"></div>
                  <span>VERIFIED</span>
                </div>
              </div>
              
              <p className="text-xs text-slate-600 font-mono">
                AUTH0 QUANTUM ENCRYPTION v2.0
              </p>
            </div>
          </div>
        </div>

        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyan-500/30"></div>
        <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-purple-500/30"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-purple-500/30"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-cyan-500/30"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
        {/* Animated Background Grid */}
        <div className="fixed inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
        
        {/* Subtle Ambient Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Minimal Stars */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-cyan-400/20 rounded-full animate-glitch-star"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            ></div>
          ))}
          
          {/* Ambient Glow */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-cyan-600/5 rounded-full blur-3xl animate-pulse-slow animation-delay-500"></div>
        </div>

        {/* Header */}
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 relative z-10 shadow-lg">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo Section */}
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="relative w-12 h-12 transform transition-transform group-hover:scale-110">
                  <img 
                    src={robotCowboy}
                    alt="TicketBuddy Logo"
                    className="w-full h-full object-cover rounded-full border-2 border-cyan-500/40 p-1 bg-slate-800/80 drop-shadow-lg"
                  />
                  <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                    TICKETBUDDY
                  </h1>
                  <p className="text-xs font-mono text-slate-500 tracking-wider">PROTOCOL v2.0</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <nav className="flex gap-6">
                  <Link 
                    to="/" 
                    className="text-slate-400 hover:text-cyan-400 transition-all transform hover:translate-y-[-2px] flex items-center gap-2 group font-medium"
                  >
                    <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Submit Request
                  </Link>
                  <Link 
                    to="/board" 
                    className="text-slate-400 hover:text-purple-400 transition-all transform hover:translate-y-[-2px] flex items-center gap-2 group font-medium"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Ticket Board
                  </Link>
                </nav>
                
                {/* Auth Section */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-slate-800 transition-all border border-slate-700/50">
                    <img 
                      src={user?.picture} 
                      alt={user?.name} 
                      className="w-8 h-8 rounded-full ring-2 ring-cyan-500/50"
                    />
                    <span className="text-slate-300 font-medium">{user?.name}</span>
                  </div>
                  <button
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/50 flex items-center gap-2 font-medium"
                  >
                    <span>Logout</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Animated Border */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8 relative z-10">
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