interface AssistantPanelProps {
  latestSummary: string
}

export default function AssistantPanel({ latestSummary }: AssistantPanelProps) {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 h-fit sticky top-8">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h2 className="text-xl font-semibold text-slate-100">AI Assistant</h2>
      </div>
      
      {latestSummary ? (
        <div className="bg-slate-700 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-xs text-slate-400 mb-2 font-mono">{new Date().toLocaleTimeString()}</p>
          <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
            {latestSummary}
          </p>
        </div>
      ) : (
        <div className="bg-slate-700/50 rounded-lg p-6 text-center border-2 border-dashed border-slate-600">
          <p className="text-slate-400 italic">
            Click "Run Diagnostic" to see AI analysis and recommendations.
          </p>
        </div>
      )}
    </div>
  )
}

