interface Incident {
  ticketId: string
  service: string
  severity: string
  summary: string
  created_at: string
}

interface IncidentListProps {
  incidents: Incident[]
}

export default function IncidentList({ incidents }: IncidentListProps) {
  const severityStyles = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border border-red-500/40'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
      case 'low':
        return 'bg-green-500/20 text-green-300 border border-green-500/40'
      default:
        return 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 className="text-xl font-semibold mb-4 text-slate-100">Incidents</h2>
      
      {incidents.length === 0 ? (
        <p className="text-slate-400 italic">No incidents yet.</p>
      ) : (
        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
          {incidents.map((incident) => (
            <div 
              key={incident.ticketId} 
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex flex-col gap-1 hover:bg-slate-750 transition-colors"
            >
              <div className="flex items-start justify-between mb-1">
                <span className="font-mono text-sm font-bold text-blue-400">
                  {incident.ticketId}
                </span>
                <span 
                  className={`text-xs px-2 py-1 rounded-md ${severityStyles(incident.severity)}`}
                >
                  {incident.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-200 text-sm mb-1">{incident.summary}</p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="capitalize">{incident.service}</span>
                <span>{new Date(incident.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

