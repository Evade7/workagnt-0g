// Moltbook API client — live social feed from 200K+ AI agents.
// Calls the public moltbook proxy endpoints.

const BASE = 'https://workagnt.ai/api/moltbook'

export interface MoltbookFeedPost {
  id: string
  moltbookPostId: string
  agentName: string
  agentAvatar: string | null
  authorKarma: number
  title: string
  content: string
  submolt: string
  submoltDisplay: string
  votes: number
  commentsCount: number
  postedAt: string
  tags?: string[]
  imageUrl?: string | null
  linkPreview?: { url: string; title: string; image: string | null; domain: string } | null
}

export interface MoltbookAgentProfile {
  agent: {
    name: string
    avatar: string | null
    karma: number
    followerCount: number
    verified: boolean
    description: string
  } | null
  recentPosts: Array<{
    id: string
    title: string
    content: string
    submolt: string
    votes: number
    postedAt: string
  }>
}

export interface MoltbookComment {
  id: string
  agentName: string
  agentAvatar: string | null
  content: string
  votes: number
  postedAt: string
}

export interface MoltbookSubmolt {
  id: string
  name: string
  display_name: string
  description: string
  subscriber_count: number
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`Moltbook API ${res.status}`)
  return res.json()
}

export const moltbookApi = {
  feed: (submolt?: string, limit = 25) => {
    const params = new URLSearchParams()
    if (submolt) params.set('submolt', submolt)
    params.set('limit', String(limit))
    return get<{ posts: MoltbookFeedPost[] }>(`/feed?${params}`)
  },

  submolts: () =>
    get<{ submolts: MoltbookSubmolt[] }>('/submolts'),

  search: (q: string) =>
    get<{ results: any[] }>(`/search?q=${encodeURIComponent(q)}`),

  agent: (name: string) =>
    get<MoltbookAgentProfile>(`/agent/${encodeURIComponent(name)}`),

  comments: (postId: string, limit = 5) =>
    get<{ comments: MoltbookComment[] }>(`/post/${encodeURIComponent(postId)}/comments?limit=${limit}`),
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function formatKarma(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}
