import { useAuth0 } from '@auth0/auth0-react'
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ProtectedRoute } from './components/ProtectedRoute'
import TicketBoard from './pages/TicketBoard'
import GitHubIntegration from './pages/GitHubIntegration'
import TicketSubmission from './pages/TicketSubmission'
import Copilot from './components/Copilot'
import robotCowboy from './image.png'

function App() {
  const { isLoading, error, loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const [ticketsCount, setTicketsCount] = useState<number>(0)
  const [githubConnected, setGithubConnected] = useState<boolean>(false)
  
  // Easter Egg States
  const [logoClicks, setLogoClicks] = useState(0)
  const [hyperSpaceMode, setHyperSpaceMode] = useState(false)
  const [showLasso, setShowLasso] = useState(false)
  const [showRowdy, setShowRowdy] = useState(false)
  const [keySequence, setKeySequence] = useState('')
  const [showBadge, setShowBadge] = useState(false)
  const [badgeHoverTimer, setBadgeHoverTimer] = useState<number | null>(null)
  
  // Random Rocket State
  const [showRocket, setShowRocket] = useState(false)
  const [rocketPosition, setRocketPosition] = useState({ x: 50, y: 50 })
  const [rocketLaunched, setRocketLaunched] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787'

  // Fetch context data for copilot
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchContext = async () => {
      try {
        // Fetch tickets count
        const ticketsRes = await fetch(`${API_BASE}/tickets`)
        if (ticketsRes.ok) {
          const ticketsData = await ticketsRes.json()
          setTicketsCount(ticketsData.tickets?.length || 0)
        }

        // Fetch GitHub connection status
        const githubRes = await fetch(`${API_BASE}/github/summary`)
        if (githubRes.ok) {
          const githubData = await githubRes.json()
          setGithubConnected(githubData.connected || false)
        }
      } catch (error) {
        console.error('Failed to fetch copilot context:', error)
      }
    }

    fetchContext()
    // Refresh context every 30 seconds
    const interval = setInterval(fetchContext, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, API_BASE]);

  // 🤠 EASTER EGG 1: Type "YEEHAW" for Lasso Animation
  // 🎉 EASTER EGG 4: Type "HOWDY" for RowdyHacks celebration
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const newSequence = (keySequence + e.key.toUpperCase()).slice(-6)
      setKeySequence(newSequence)
      
      if (newSequence === 'YEEHAW') {
        setShowLasso(true)
        console.log('🤠 YEEHAW! Space Lasso activated!')
        setTimeout(() => setShowLasso(false), 3000)
        setKeySequence('')
      } else if (newSequence.endsWith('HOWDY')) {
        setShowRowdy(true)
        console.log('🎉 HOWDY! LET\'S GET ROWDY!')
        setTimeout(() => setShowRowdy(false), 3000)
        setKeySequence('')
      }
    }
    
    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [keySequence])

  // 🚀 EASTER EGG 2: Click Logo 10 times for Hyper-Space Mode
  const handleLogoClick = () => {
    const newCount = logoClicks + 1
    setLogoClicks(newCount)
    
    if (newCount === 10) {
      setHyperSpaceMode(true)
      console.log('🚀 HYPER-SPACE MODE ACTIVATED!')
      setTimeout(() => {
        setHyperSpaceMode(false)
        setLogoClicks(0)
      }, 5000)
    }
    
    // Reset counter after 3 seconds of inactivity
    setTimeout(() => {
      if (logoClicks === newCount) {
        setLogoClicks(0)
      }
    }, 3000)
  }

  // ⭐ EASTER EGG 3: Hover over title for 5 seconds for Space Sheriff Badge
  const handleTitleHoverStart = () => {
    const timer = window.setTimeout(() => {
      setShowBadge(true)
      console.log('⭐ Congrats! You\'ve been appointed Space Sheriff!')
    }, 5000)
    setBadgeHoverTimer(timer)
  }

  const handleTitleHoverEnd = () => {
    if (badgeHoverTimer) {
      window.clearTimeout(badgeHoverTimer)
      setBadgeHoverTimer(null)
    }
  }

  // 🚀 Random Rocket that appears every 10-20 seconds
  useEffect(() => {
    const spawnRocket = () => {
      // Random position (avoid edges)
      const x = Math.random() * 70 + 15 // 15% to 85%
      const y = Math.random() * 60 + 20 // 20% to 80%
      
      setRocketPosition({ x, y })
      setShowRocket(true)
      setRocketLaunched(false)
      
      // Hide after 2 seconds if not clicked
      setTimeout(() => {
        setShowRocket(false)
      }, 2000)
    }
    
    // Spawn rocket every 10-20 seconds
    const randomInterval = () => {
      const delay = Math.random() * 10000 + 10000 // 10-20 seconds
      return setTimeout(() => {
        spawnRocket()
        setNextRocket()
      }, delay)
    }
    
    let nextRocket = randomInterval()
    
    const setNextRocket = () => {
      nextRocket = randomInterval()
    }
    
    return () => clearTimeout(nextRocket)
  }, [])

  const handleRocketClick = () => {
    if (!rocketLaunched) {
      setRocketLaunched(true)
      console.log('🚀 ROCKET LAUNCHED!')
      
      // Hide after launch animation
      setTimeout(() => {
        setShowRocket(false)
      }, 1000)
    }
  }

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
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-slate-100 relative overflow-hidden">
        {/* 🌌 CELESTIAL BACKGROUND */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Deep Space Gradient */}
          <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-indigo-950/40 to-slate-950"></div>
          
          {/* Nebula Clouds */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-3xl animate-pulse-slow animation-delay-500"></div>
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-3xl animate-pulse-slow animation-delay-300"></div>
          
          {/* Star Field - Multiple Layers */}
          {[...Array(100)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute rounded-full bg-white animate-glitch-star"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.7 + 0.3,
              }}
            ></div>
          ))}
          
          {/* Distant Galaxies */}
          {[...Array(5)].map((_, i) => (
            <div
              key={`galaxy-${i}`}
              className="absolute rounded-full blur-sm animate-pulse-slow"
              style={{
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
                width: `${Math.random() * 40 + 20}px`,
                height: `${Math.random() * 40 + 20}px`,
                background: `radial-gradient(circle, rgba(${Math.random() > 0.5 ? '139, 92, 246' : '34, 211, 238'}, 0.3) 0%, transparent 70%)`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            ></div>
          ))}
          
          {/* Shooting Stars */}
          <div className="absolute top-10 left-0 w-2 h-0.5 bg-gradient-to-r from-white via-cyan-400 to-transparent animate-shooting-star-fast"></div>
          <div className="absolute top-40 left-0 w-2 h-0.5 bg-gradient-to-r from-white via-purple-400 to-transparent animate-shooting-star-delayed"></div>
          <div className="absolute top-60 left-0 w-2 h-0.5 bg-gradient-to-r from-white via-pink-400 to-transparent animate-shooting-star-delayed-2"></div>
        </div>
        
        {/* 🤠 EASTER EGG VISUALS */}
        
        {/* Lasso Animation (Easter Egg 1) */}
        {showLasso && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="relative">
              <svg className="w-96 h-96 animate-lasso" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="80" stroke="#fbbf24" strokeWidth="4" strokeDasharray="10 5" />
                <circle cx="100" cy="100" r="60" stroke="#fbbf24" strokeWidth="3" strokeDasharray="8 4" />
                <circle cx="100" cy="100" r="40" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 3" />
                <text x="100" y="110" textAnchor="middle" fill="#fbbf24" fontSize="32" fontWeight="bold" className="font-western">
                  YEEHAW!
                </text>
              </svg>
              {/* Caught Stars */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-4 h-4 text-yellow-400 animate-gold-sparkle"
                  style={{
                    top: `${50 + Math.cos((i * Math.PI * 2) / 12) * 100}px`,
                    left: `${50 + Math.sin((i * Math.PI * 2) / 12) * 100}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  ⭐
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* RowdyHacks Celebration (Easter Egg 4) */}
        {showRowdy && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="relative">
              <svg className="w-96 h-96 animate-lasso" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="80" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="10 5" />
                <circle cx="100" cy="100" r="60" stroke="#22d3ee" strokeWidth="3" strokeDasharray="8 4" />
                <circle cx="100" cy="100" r="40" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 3" />
                <text x="100" y="95" textAnchor="middle" fill="#8b5cf6" fontSize="24" fontWeight="bold" className="font-western">
                  LET'S GET
                </text>
                <text x="100" y="120" textAnchor="middle" fill="#22d3ee" fontSize="32" fontWeight="bold" className="font-western">
                  ROWDY!
                </text>
              </svg>
              {/* Celebration Emojis */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-3xl animate-gold-sparkle"
                  style={{
                    top: `${50 + Math.cos((i * Math.PI * 2) / 12) * 120}px`,
                    left: `${50 + Math.sin((i * Math.PI * 2) / 12) * 120}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  {['🎉', '🚀', '🤠', '⭐'][i % 4]}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Hyper-Space Mode (Easter Egg 2) */}
        {hyperSpaceMode && (
          <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
            <div className="absolute inset-0 bg-purple-600/20"></div>
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-24 bg-gradient-to-b from-cyan-400 to-transparent animate-hyper-space"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              ></div>
            ))}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-cyan-400 font-space animate-pulse">
              HYPER-SPACE!
            </div>
          </div>
        )}
        
        {/* Space Sheriff Badge (Easter Egg 3) */}
        {showBadge && (
          <div className="fixed top-4 right-4 z-50 animate-badge-reveal">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-yellow-300 animate-cosmic-trail">
                <div className="text-center">
                  <div className="text-3xl">⭐</div>
                  <div className="text-xs font-bold text-slate-900 font-western">SHERIFF</div>
                </div>
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-slate-900/90 px-3 py-1 rounded-lg border border-yellow-500/50">
                <p className="text-xs text-yellow-400 font-space">Space Sheriff Unlocked!</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Tumbleweed Rolling Across Screen */}
        <div className="fixed bottom-4 w-8 h-8 text-amber-700/40 animate-tumbleweed pointer-events-none text-2xl z-10">
          🌾
        </div>
        
        {/* Ambient UFO */}
        <div className="fixed top-20 right-32 pointer-events-none z-10">
          <div className="relative animate-ufo">
            <div className="text-4xl opacity-30">🛸</div>
          </div>
        </div>

        {/* 🚀 Random Clickable Rocket */}
        {showRocket && (
          <div
            className={`fixed z-20 cursor-pointer transition-transform ${
              rocketLaunched ? 'animate-rocket-launch' : 'animate-rocket-appear rocket-idle'
            }`}
            style={{
              top: `${rocketPosition.y}%`,
              left: `${rocketPosition.x}%`,
            }}
            onClick={handleRocketClick}
            title="Click to launch! 🚀"
          >
            <div className="relative">
              {/* Rocket Body */}
              <div className="text-6xl filter drop-shadow-lg">🚀</div>
              
              {/* Fire Trail (only when not launched) */}
              {!rocketLaunched && (
                <div className="absolute bottom-0 right-0 w-8 h-12 opacity-80 animate-rocket-fire">
                  <div className="w-full h-full bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent rounded-full blur-sm"></div>
                </div>
              )}
              
              {/* Launch particles */}
              {rocketLaunched && (
                <>
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute text-2xl animate-gold-sparkle"
                      style={{
                        top: `${Math.random() * 40}px`,
                        left: `${Math.random() * 40}px`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    >
                      ✨
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-slate-900/80 backdrop-blur-md border-b-2 border-amber-500/30 relative z-10 shadow-lg shadow-purple-900/50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo Section - Easter Egg 2: Click 10 times! */}
              <div className="flex items-center gap-4 group cursor-pointer" onClick={handleLogoClick}>
                <div className="relative w-12 h-12 transform transition-transform group-hover:scale-110">
                  <img 
                    src={robotCowboy}
                    alt="TicketBuddy Space Cowboy"
                    className="w-full h-full object-cover rounded-full border-2 border-amber-500/40 p-1 bg-slate-800/80 drop-shadow-lg"
                  />
                  <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {/* Click counter indicator */}
                  {logoClicks > 0 && logoClicks < 10 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
                      {logoClicks}
                    </div>
                  )}
                </div>
                <div onMouseEnter={handleTitleHoverStart} onMouseLeave={handleTitleHoverEnd}>
                  <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400 font-space tracking-wider">
                    TICKETBUDDY
                  </h1>
                  <p className="text-xs font-mono text-amber-500/70 tracking-widest">🤠 SPACE COWBOY v2.0 🚀</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <nav className="flex gap-6 font-space text-sm">
                  <Link 
                    to="/" 
                    className="text-slate-400 hover:text-amber-400 transition-all transform hover:translate-y-[-2px] flex items-center gap-2 group font-medium hover:animate-spur-jingle"
                  >
                    <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Submit Request
                  </Link>
                  <Link 
                    to="/board" 
                    className="text-slate-400 hover:text-purple-400 transition-all transform hover:translate-y-[-2px] flex items-center gap-2 group font-medium hover:animate-spur-jingle"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Ticket Board
                  </Link>
                  <Link 
                    to="/github" 
                    className="text-slate-400 hover:text-cyan-400 transition-all transform hover:translate-y-[-2px] flex items-center gap-2 group font-medium hover:animate-spur-jingle"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
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
            <Route 
              path="/github" 
              element={
                <ProtectedRoute>
                  <GitHubIntegration />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>

        {/* Copilot - Available on all pages */}
        {isAuthenticated && (
          <Copilot ticketsCount={ticketsCount} githubConnected={githubConnected} />
        )}
      </div>
    </Router>
  )
}

export default App
