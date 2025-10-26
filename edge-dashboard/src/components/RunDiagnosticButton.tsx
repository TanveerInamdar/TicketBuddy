interface RunDiagnosticButtonProps {
  onClick: () => void
  isLoading: boolean
}

export default function RunDiagnosticButton({ onClick, isLoading }: RunDiagnosticButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 
                 text-white font-bold rounded-lg transition-all duration-200 
                 disabled:cursor-not-allowed flex items-center justify-center gap-3
                 text-lg shadow-lg hover:shadow-xl disabled:shadow-none
                 transform hover:scale-[1.02] disabled:transform-none"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Running Diagnostic...
        </>
      ) : (
        'Run Diagnostic on Checkout'
      )}
    </button>
  )
}

