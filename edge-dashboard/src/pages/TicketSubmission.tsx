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
        setSubmitStatus('success')
        setFormData({ description: '' })
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
      <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-slate-100">Submit Functionality Request</h2>
        
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
              placeholder="Describe the functionality you'd like to see implemented. Be as detailed as possible - our AI will analyze your request and automatically assign priority, create a title, and assign it to the appropriate team member..."
            />
            <p className="mt-2 text-sm text-slate-400">
              💡 Our AI will automatically analyze your request and fill in the title, priority level, and assignee based on your description.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              '✅ Functionality request submitted! AI is processing your request and will assign priority, title, and team member. Redirecting to ticket board...'
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
