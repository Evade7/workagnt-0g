// Thin client for WorkAgnt's public /api/v1 endpoints.
// Reuses agent discovery from the production platform.

const BASE = 'https://workagnt.ai/api/v1'

export interface WorkAgntAgent {
  slug: string
  name: string
  category: string
  description: string | null
  pricing: string | null
  price_amount: number | null
  total_chats: number
  endpoint: string
  public_url: string
}

export interface DiscoverResponse {
  platform: string
  tagline: string
  docs: string
  rate_limits: { free_chats: number; free_agents_created: number }
  agents: WorkAgntAgent[]
}

export async function discoverAgents(): Promise<DiscoverResponse> {
  const res = await fetch(`${BASE}/agents/discover`, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`Discover failed: ${res.status}`)
  return res.json()
}
