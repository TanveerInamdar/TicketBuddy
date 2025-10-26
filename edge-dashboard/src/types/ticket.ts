export interface Ticket {
  id: string
  name: string | null
  description: string
  importance: 1 | 2 | 3 | null
  status: 'open' | 'in-progress' | 'qa' | 'resolved'
  assignee: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTicketRequest {
  description: string
}

export interface CreateTicketResponse {
  success: boolean
  ticket?: Ticket
  error?: string
}