import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreateTicketRequest } from '../types/ticket'

export default function TicketSubmission() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<CreateTicketRequest>({
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isRedirecting, setIsRedirecting] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        setSubmitStatus('success')
        setFormData({ description: '' })
        
        // Log the number of tickets created
        console.log(`✅ Created ${result.count} ticket(s) from your request`)
        
        // Redirect to ticket board after successful submission
        setTimeout(() => {
          setIsRedirecting(true)
          navigate('/board')
        }, 1500) // Wait 1.5 seconds to show success message
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Failed to submit ticket:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-8 border-2 border-amber-500/30 shadow-xl shadow-purple-900/30 relative overflow-hidden">
        {/* Space Cowboy Decorative Elements */}
        <div className="absolute top-0 right-0 text-6xl opacity-10 pointer-events-none">🤠</div>
        <div className="absolute bottom-0 left-0 text-4xl opacity-5 pointer-events-none">🚀</div>
        
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400 font-space tracking-wide relative">
          🎯 Submit Mission Request
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              Describe Your Functionality Request *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe the functionality you'd like to see implemented. You can mention multiple features in one request - our AI will automatically break them down into separate tickets. Be as detailed as possible..."
            />
            <p className="mt-2 text-sm text-slate-400">
              💡 Our AI will automatically analyze your request and create separate tickets for each functionality mentioned. Each ticket will have its own title, priority level, and assigned team member.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 via-purple-600 to-cyan-600 hover:from-amber-500 hover:to-cyan-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-space shadow-lg hover:shadow-xl hover:shadow-purple-500/50 border-2 border-amber-400/30"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Functionality Request'
            )}
          </button>
        </form>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="mt-4 p-4 bg-green-500/20 border border-green-500/40 rounded-lg text-green-300">
            {isRedirecting ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redirecting to ticket board...
              </div>
            ) : (
              '✅ Functionality request submitted! AI is analyzing your request and will create the appropriate number of tickets based on the functionalities mentioned. Redirecting to ticket board...'
            )}
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300">
            ❌ Failed to submit functionality request. Please try again.
          </div>
        )}
      </div>
    </div>
  )
}
