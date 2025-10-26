export interface Ticket {
  id: string
  name: string
  description: string
  importance: 1 | 2 | 3
  status: 'open' | 'in-progress' | 'qa' | 'resolved'
  assignee: string
  createdAt: string
  updatedAt: string
}

export interface CreateTicketRequest {
  name: string
  description: string
  importance: 1 | 2 | 3
  assignee: string
}

export interface CreateTicketResponse {
  success: boolean
  ticket?: Ticket
  error?: string
}
