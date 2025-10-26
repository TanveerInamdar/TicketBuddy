import { useState, useEffect } from 'react'
import { Ticket } from '../types/ticket'

export default function TicketBoard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787'

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
      }
    } catch (error) {
      console.error('Failed to update ticket:', error)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const getTicketsByStatus = (status: Ticket['status']) => {
    return tickets.filter(ticket => ticket.status === status)
  }

  const getImportanceColor = (importance: number) => {
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

  const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <div className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-slate-100 text-sm">{ticket.name}</h3>
        <span className={`text-xs px-2 py-1 rounded ${getImportanceColor(ticket.importance)}`}>
          P{ticket.importance}
        </span>
      </div>
      
      <p className="text-slate-300 text-xs mb-3 line-clamp-3">{ticket.description}</p>
      
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
        <span>Assignee: {ticket.assignee}</span>
        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="flex gap-2">
        {ticket.status !== 'resolved' && (
          <button
            onClick={() => {
              const nextStatus: Ticket['status'] = 
                ticket.status === 'open' ? 'in-progress' :
                ticket.status === 'in-progress' ? 'qa' :
                ticket.status === 'qa' ? 'resolved' : 'resolved'
              updateTicketStatus(ticket.id, nextStatus)
            }}
            className="flex-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
          >
            Move Next
          </button>
        )}
        
        {ticket.status === 'resolved' && (
          <button
            onClick={() => updateTicketStatus(ticket.id, 'open')}
            className="flex-1 px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded transition-colors"
          >
            Reopen
          </button>
        )}
      </div>
    </div>
  )

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
