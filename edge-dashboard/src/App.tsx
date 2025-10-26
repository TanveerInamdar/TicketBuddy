import { useState, useEffect } from 'react'
import IncidentList from './components/IncidentList'
import RunDiagnosticButton from './components/RunDiagnosticButton'
import AssistantPanel from './components/AssistantPanel'

interface Incident {
  ticketId: string
  service: string
  severity: string
  summary: string
  created_at: string
}

interface DiagnosticResponse {
  incidentFiled: boolean
  ticketId: string
  severity: string
  summary: string
  recommendedFix: string
  created_at: string
}

function App() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [latestSummary, setLatestSummary] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // TODO: Replace with actual Worker URL from env
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787'

  const fetchIncidents = async () => {
    try {
      const response = await fetch(`${API_BASE}/incidents`)
      const data = await response.json()
      setIncidents(data.incidents || [])
    } catch (error) {
      console.error('Failed to fetch incidents:', error)
    }
  }

  useEffect(() => {
    fetchIncidents()
  }, [])

  const handleRunDiagnostic = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE}/mcp/call-tool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'summarize_checkout_health',
          args: { service: 'checkout', windowMinutes: 60 }
        })
      })

      const data: DiagnosticResponse = await response.json()
      
      // Refresh incidents list
      await fetchIncidents()
      
      // Create AI assistant summary
      const summary = `Severity: ${data.severity.toUpperCase()}. ${data.summary} Recommended fix: ${data.recommendedFix}`
      setLatestSummary(summary)
    } catch (error) {
      console.error('Failed to run diagnostic:', error)
      setLatestSummary('Error: Failed to run diagnostic. Check console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-blue-400">EdgeTool On-Call Console</h1>
          <p className="text-sm text-slate-400">AI-Powered Incident Management</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <RunDiagnosticButton 
              onClick={handleRunDiagnostic}
              isLoading={isLoading}
            />
            <IncidentList incidents={incidents} />
          </div>

          {/* Right Column */}
          <div>
            <AssistantPanel latestSummary={latestSummary} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

