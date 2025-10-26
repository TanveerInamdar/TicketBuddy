import { useState, useEffect } from 'react'
import { Ticket } from '../types/ticket'

export default function TicketBoard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set())

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787'

  const toggleTicketExpansion = (ticketId: string) => {
    setExpandedTickets(prev => {
      const newSet = new Set(prev)
      if (newSet.has(ticketId)) {
        newSet.delete(ticketId)
      } else {
        newSet.add(ticketId)
      }
      return newSet
    })
  }

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_BASE}/tickets`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateTicketStatus = async (ticketId: string, newStatus: Ticket['status']) => {
    try {
      const response = await fetch(`${API_BASE}/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setTickets(prev => prev.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() }
            : ticket
        ))
        console.log(`✅ Ticket ${ticketId} moved to ${newStatus}`)
      } else {
        console.error(`❌ Failed to update ticket ${ticketId}:`, response.status, response.statusText)
      }
    } catch (error) {
      console.error('❌ Failed to update ticket:', error)
    }
  }

  const updateTicketPriority = async (ticketId: string, newPriority: 1 | 2 | 3) => {
    try {
      const response = await fetch(`${API_BASE}/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ importance: newPriority })
      })

      if (response.ok) {
        setTickets(prev => prev.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, importance: newPriority, updatedAt: new Date().toISOString() }
            : ticket
        ))
        console.log(`✅ Ticket ${ticketId} priority updated to ${newPriority}`)
      } else {
        console.error(`❌ Failed to update ticket priority ${ticketId}:`, response.status, response.statusText)
      }
    } catch (error) {
      console.error('❌ Failed to update ticket priority:', error)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const getTicketsByStatus = (status: Ticket['status']) => {
    return tickets.filter(ticket => ticket.status === status)
  }

  const getImportanceColor = (importance: number | null) => {
    if (!importance) return 'bg-slate-500/20 text-slate-300 border-slate-500/40'
    switch (importance) {
      case 3: return 'bg-red-500/20 text-red-400 border-red-500/40'
      case 2: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
      case 1: return 'bg-green-500/20 text-green-300 border-green-500/40'
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/40'
    }
  }

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-400 border-blue-500/40'
      case 'in-progress': return 'bg-orange-500/20 text-orange-400 border-orange-500/40'
      case 'qa': return 'bg-purple-500/20 text-purple-400 border-purple-500/40'
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/40'
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/40'
    }
  }

  const TicketCard = ({ ticket }: { ticket: Ticket }) => {
    const isExpanded = expandedTickets.has(ticket.id)
    
    return (
      <div className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-all">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
            <span>{ticket.name || 'AI Processing...'}</span>
            <button
              onClick={() => toggleTicketExpansion(ticket.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              title={isExpanded ? "Collapse" : "Expand for details"}
            >
              <svg 
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </h3>
          <select
            value={ticket.importance || 1}
            onChange={(e) => updateTicketPriority(ticket.id, parseInt(e.target.value) as 1 | 2 | 3)}
            onClick={(e) => e.stopPropagation()}
            className={`text-xs px-2 py-1 rounded font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${getImportanceColor(ticket.importance || 1)}`}
            style={{
              backgroundColor: ticket.importance === 3 ? 'rgba(239, 68, 68, 0.2)' : 
                             ticket.importance === 2 ? 'rgba(234, 179, 8, 0.2)' : 
                             'rgba(34, 197, 94, 0.2)'
            }}
            title="Change priority"
          >
            <option value={1} style={{ backgroundColor: '#1e293b', color: '#86efac' }}>🟢 Low</option>
            <option value={2} style={{ backgroundColor: '#1e293b', color: '#fde047' }}>🟡 Medium</option>
            <option value={3} style={{ backgroundColor: '#1e293b', color: '#f87171' }}>🔴 High</option>
          </select>
        </div>
        
        <p className={`text-slate-300 text-xs mb-3 transition-all ${isExpanded ? '' : 'line-clamp-3'}`}>
          {ticket.description}
        </p>
        
        {isExpanded && (
          <div className="border-t border-slate-600 pt-3 mb-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Ticket ID:</span>
              <span className="text-slate-200 font-mono">{ticket.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Assignee:</span>
              <span className="text-slate-200">{ticket.assignee || 'AI Processing...'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Created:</span>
              <span className="text-slate-200">{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Last Updated:</span>
              <span className="text-slate-200">{new Date(ticket.updatedAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status:</span>
              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(ticket.status)}`}>
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </span>
            </div>
            {ticket.github_pr_number && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">GitHub PR:</span>
                <span className="text-blue-400 font-mono">#{ticket.github_pr_number}</span>
              </div>
            )}
            {ticket.github_issue_number && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">GitHub Issue:</span>
                <span className="text-purple-400 font-mono">#{ticket.github_issue_number}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span>Assignee: {ticket.assignee || 'AI Processing...'}</span>
          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
        </div>

      <div className="flex gap-2">
        {/* Move Back Button */}
        {ticket.status !== 'open' && (
          <button
            onClick={() => {
              const prevStatus: Ticket['status'] = 
                ticket.status === 'in-progress' ? 'open' :
                ticket.status === 'qa' ? 'in-progress' :
                ticket.status === 'resolved' ? 'qa' : 'open'
              updateTicketStatus(ticket.id, prevStatus)
            }}
            className="flex-1 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors flex items-center justify-center gap-1"
            title={`Move back to ${ticket.status === 'in-progress' ? 'Open' : ticket.status === 'qa' ? 'In Progress' : 'QA'}`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
        
        {/* Move Next Button */}
        {ticket.status !== 'resolved' && (
          <button
            onClick={() => {
              const nextStatus: Ticket['status'] = 
                ticket.status === 'open' ? 'in-progress' :
                ticket.status === 'in-progress' ? 'qa' :
                ticket.status === 'qa' ? 'resolved' : 'resolved'
              updateTicketStatus(ticket.id, nextStatus)
            }}
            className="flex-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors flex items-center justify-center gap-1"
            title={`Move forward to ${ticket.status === 'open' ? 'In Progress' : ticket.status === 'in-progress' ? 'QA' : 'Resolved'}`}
          >
            Next
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
        {/* Reopen Button (only for resolved tickets) */}
        {ticket.status === 'resolved' && (
          <button
            onClick={() => updateTicketStatus(ticket.id, 'open')}
            className="flex-1 px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded transition-colors flex items-center justify-center gap-1"
            title="Reopen ticket and move back to Open"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reopen
          </button>
        )}
      </div>
      </div>
    )
  }

  const Column = ({ title, status, tickets }: { title: string, status: Ticket['status'], tickets: Ticket[] }) => (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-100">{title}</h2>
        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(status)}`}>
          {tickets.length}
        </span>
      </div>
      
      <div className="space-y-3 min-h-[400px]">
        {tickets.length === 0 ? (
          <p className="text-slate-400 text-sm italic text-center py-8">
            No tickets
          </p>
        ) : (
          tickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))
        )}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-100">Ticket Board</h1>
        <button
          onClick={fetchTickets}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Column title="Open" status="open" tickets={getTicketsByStatus('open')} />
        <Column title="In Progress" status="in-progress" tickets={getTicketsByStatus('in-progress')} />
        <Column title="QA" status="qa" tickets={getTicketsByStatus('qa')} />
        <Column title="Resolved" status="resolved" tickets={getTicketsByStatus('resolved')} />
      </div>
    </div>
  )
}
