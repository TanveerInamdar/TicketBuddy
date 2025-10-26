import { useState, useEffect } from 'react'
import { Ticket } from '../types/ticket'

interface GitHubSummary {
  connected: boolean
  repo: {
    id: string
    url: string
    default_branch: string
    connected_at: string
  } | null
  counts: {
    openPRs: number
    openIssues: number
  }
  recentEvents: Array<{
    id: string
    type: string
    summary: string
    created_at: string
  }>
}

interface PullRequest {
  id: number
  repo_id: string
  title: string
  author: string
  state: string
  merged: number
  html_url: string
  created_at: string
  updated_at: string
  head_sha?: string
}

interface Issue {
  id: number
  repo_id: string
  title: string
  author: string
  state: string
  html_url: string
  created_at: string
  updated_at: string
}

export default function GitHubIntegration() {
  const [repoUrl, setRepoUrl] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [summary, setSummary] = useState<GitHubSummary | null>(null)
  const [activeTab, setActiveTab] = useState<'prs' | 'issues' | 'events'>('prs')
  const [prs, setPrs] = useState<PullRequest[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [showNewIssueModal, setShowNewIssueModal] = useState(false)
  const [newIssue, setNewIssue] = useState({ title: '', body: '' })
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicketId, setSelectedTicketId] = useState<string>('')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787'

  useEffect(() => {
    fetchSummary()
    fetchTickets()

    // Refetch when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSummary()
        if (summary?.connected && summary.repo) {
          fetchData()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    if (summary?.connected && summary.repo) {
      fetchData()
    }
  }, [activeTab, summary])

  const refreshData = async () => {
    await fetchSummary()
    if (summary?.connected && summary.repo) {
      await fetchData()
    }
    await fetchTickets()
  }

  const fetchSummary = async () => {
    try {
      setIsLoading(true)
      setLoadError(null)
      console.log('Fetching summary from:', `${API_BASE}/github/summary`)
      const response = await fetch(`${API_BASE}/github/summary`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      console.log('Summary response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Summary data:', data)
        setSummary(data)
      } else {
        const errorText = await response.text()
        setLoadError(`Failed to fetch summary: ${response.status} ${errorText}`)
        // Set a default empty summary so the page doesn't hang
        setSummary({
          connected: false,
          repo: null,
          counts: { openPRs: 0, openIssues: 0 },
          recentEvents: []
        })
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error)
      setLoadError(`Network error: ${(error as Error).message}`)
      // Set a default empty summary so the page doesn't hang
      setSummary({
        connected: false,
        repo: null,
        counts: { openPRs: 0, openIssues: 0 },
        recentEvents: []
      })
    } finally {
      setIsLoading(false)
    }
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
    }
  }

  const connectRepo = async () => {
    setIsConnecting(true)
    try {
      const repoInput = repoUrl.trim()
      let body: any = {}
      
      if (repoInput.includes('github.com')) {
        body.url = repoInput
      } else {
        body.repo = repoInput
      }

      const response = await fetch(`${API_BASE}/github/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        await fetchSummary()
        setRepoUrl('')
      } else {
        alert('Failed to connect repository')
      }
    } catch (error) {
      console.error('Failed to connect:', error)
      alert('Failed to connect repository')
    } finally {
      setIsConnecting(false)
    }
  }

  const fetchData = async () => {
    if (!summary?.repo) return

    const repoId = summary.repo.id
    const [owner, name] = repoId.split('/')

    const fetchOptions = {
      cache: 'no-store' as RequestCache,
      headers: { 'Cache-Control': 'no-cache' }
    }

    try {
      if (activeTab === 'prs') {
        const response = await fetch(`${API_BASE}/github/${owner}/${name}/prs?state=open`, fetchOptions)
        const data = await response.json()
        setPrs(data.prs || [])
      } else if (activeTab === 'issues') {
        const response = await fetch(`${API_BASE}/github/${owner}/${name}/issues?state=open`, fetchOptions)
        const data = await response.json()
        setIssues(data.issues || [])
      } else {
        const response = await fetch(`${API_BASE}/github/${owner}/${name}/events?limit=20`, fetchOptions)
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const openMergeModal = (pr: PullRequest) => {
    setSelectedPR(pr)
    setSelectedTicketId('')
    setShowMergeModal(true)
  }

  const mergePR = async () => {
    if (!summary?.repo || !selectedPR) return

    const repoId = summary.repo.id
    const [owner, name] = repoId.split('/')

    try {
      const body: any = { method: 'squash' }
      if (selectedTicketId) {
        body.ticket_id = selectedTicketId
      }

      const response = await fetch(`${API_BASE}/github/${owner}/${name}/pr/${selectedPR.id}/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        alert(selectedTicketId ? 'PR merged and ticket resolved!' : 'PR merged successfully!')
        setShowMergeModal(false)
        setSelectedPR(null)
        setSelectedTicketId('')
        fetchData()
        fetchSummary()
        fetchTickets()
      } else {
        const error = await response.json()
        alert(`Failed to merge: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to merge:', error)
      alert('Failed to merge PR')
    }
  }

  const createIssue = async () => {
    if (!summary?.repo || !newIssue.title.trim()) return

    const repoId = summary.repo.id
    const [owner, name] = repoId.split('/')

    try {
      const response = await fetch(`${API_BASE}/github/${owner}/${name}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIssue)
      })

      if (response.ok) {
        setShowNewIssueModal(false)
        setNewIssue({ title: '', body: '' })
        fetchData()
        fetchSummary()
      } else {
        alert('Failed to create issue')
      }
    } catch (error) {
      console.error('Failed to create issue:', error)
      alert('Failed to create issue')
    }
  }

  const closeIssue = async (issue: Issue) => {
    if (!summary?.repo) return

    const repoId = summary.repo.id
    const [owner, name] = repoId.split('/')

    try {
      const response = await fetch(`${API_BASE}/github/${owner}/${name}/issues/${issue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: 'closed' })
      })

      if (response.ok) {
        fetchData()
        fetchSummary()
      }
    } catch (error) {
      console.error('Failed to close issue:', error)
    }
  }

  const unlinkRepo = async () => {
    if (!confirm('Are you sure you want to unlink this repository?')) return

    try {
      const response = await fetch(`${API_BASE}/github/link`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSummary({
          connected: false,
          repo: null,
          counts: { openPRs: 0, openIssues: 0 },
          recentEvents: []
        })
        setPrs([])
        setIssues([])
        setEvents([])
      } else {
        alert('Failed to unlink repository')
      }
    } catch (error) {
      console.error('Failed to unlink:', error)
      alert('Failed to unlink repository')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
  }

  if (!summary) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-100">GitHub Integration</h1>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading GitHub Integration</h2>
          <p className="text-slate-300">{loadError || 'Failed to load GitHub integration. Please try refreshing the page.'}</p>
          <button
            onClick={() => {
              setIsLoading(true)
              fetchSummary()
            }}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-100">GitHub Integration</h1>
      
      {loadError && (
        <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
          <p className="text-yellow-300">{loadError}</p>
        </div>
      )}

      {!summary.connected ? (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Connect GitHub Repository</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="owner/repo or https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-700 text-slate-100 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={connectRepo}
              disabled={isConnecting || !repoUrl.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Card */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">{summary.repo?.id}</h2>
                  <button
                    onClick={unlinkRepo}
                    className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Change Repository
                  </button>
                </div>
                <a href={summary.repo?.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">
                  {summary.repo?.url}
                </a>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="bg-slate-700 px-3 py-1 rounded">
                  <span className="text-slate-400">PRs: </span>
                  <span className="font-semibold text-orange-400">{summary.counts.openPRs}</span>
                </div>
                <div className="bg-slate-700 px-3 py-1 rounded">
                  <span className="text-slate-400">Issues: </span>
                  <span className="font-semibold text-purple-400">{summary.counts.openIssues}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-slate-800 rounded-lg border border-slate-700">
            <div className="border-b border-slate-700 flex justify-between items-center p-2">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('prs')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'prs' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Pull Requests
                </button>
                <button
                  onClick={() => setActiveTab('issues')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'issues' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                Issues
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'events' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                Events
              </button>
              </div>
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                title="Refresh data from GitHub"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'prs' && (
                <div className="space-y-3">
                  {prs.map(pr => (
                    <div key={pr.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-blue-400">#{pr.id}</span>
                            <span className="text-slate-100 font-semibold">{pr.title}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>by {pr.author}</span>
                            <span>{new Date(pr.updated_at).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded ${pr.state === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-300'}`}>
                              {pr.state}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={pr.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded transition-colors"
                          >
                            Open
                          </a>
                          {pr.state === 'open' && (
                            <button
                              onClick={() => openMergeModal(pr)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                            >
                              Merge
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'issues' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Open Issues</h3>
                    <button
                      onClick={() => setShowNewIssueModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      New Issue
                    </button>
                  </div>
                  {issues.map(issue => (
                    <div key={issue.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-purple-400">#{issue.id}</span>
                            <span className="text-slate-100 font-semibold">{issue.title}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>by {issue.author}</span>
                            <span>{new Date(issue.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={issue.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded transition-colors"
                          >
                            Open
                          </a>
                          {issue.state === 'open' && (
                            <button
                              onClick={() => closeIssue(issue)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                            >
                              Close
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'events' && (
                <div className="space-y-2">
                  {events.map(event => (
                    <div key={event.id} className="bg-slate-700 rounded-lg p-3 border border-slate-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="text-xs text-slate-400">{event.type}</span>
                          <p className="text-sm text-slate-200">{event.summary}</p>
                        </div>
                        <span className="text-xs text-slate-400">{new Date(event.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* New Issue Modal */}
      {showNewIssueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Issue</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Issue title"
                value={newIssue.title}
                onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 text-slate-100 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Issue description (optional)"
                value={newIssue.body}
                onChange={(e) => setNewIssue({ ...newIssue, body: e.target.value })}
                rows={5}
                className="w-full px-4 py-2 bg-slate-700 text-slate-100 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewIssueModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createIssue}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Merge PR Modal */}
      {showMergeModal && selectedPR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Merge Pull Request</h2>
            <div className="space-y-4">
              <div className="bg-slate-700 p-3 rounded-lg">
                <div className="text-sm text-slate-400">PR #{selectedPR.id}</div>
                <div className="font-semibold text-slate-100">{selectedPR.title}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Link to Ticket (Optional)
                </label>
                <select
                  value={selectedTicketId}
                  onChange={(e) => setSelectedTicketId(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 text-slate-100 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None (don't link to a ticket)</option>
                  {tickets
                    .filter(t => t.status !== 'resolved')
                    .map(ticket => (
                      <option key={ticket.id} value={ticket.id}>
                        {ticket.name || ticket.description.substring(0, 50)} ({ticket.status})
                      </option>
                    ))}
                </select>
                {selectedTicketId && (
                  <p className="mt-2 text-xs text-slate-400">
                    This ticket will be marked as resolved when the PR is merged.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowMergeModal(false)
                    setSelectedPR(null)
                    setSelectedTicketId('')
                  }}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={mergePR}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Merge PR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

