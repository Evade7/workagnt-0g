// Demo agent catalog. Standalone data for the 0G hackathon submission.
// Replace with your own agent source (database, API, IPFS, onchain registry) in production.

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

const DEMO_AGENTS: WorkAgntAgent[] = [
  {
    slug: 'base-token-scanner',
    name: 'Base Token Scanner',
    category: 'defi',
    description: 'On-chain Base token analysis — holders, market cap, liquidity, recent trades.',
    pricing: 'per-chat',
    price_amount: 1,
    total_chats: 94,
    endpoint: '/api/v1/chat/base-token-scanner',
    public_url: '',
  },
  {
    slug: 'nft-explorer',
    name: 'NFT Explorer',
    category: 'nft',
    description: 'NFT collection discovery, floor tracking, and rarity analysis.',
    pricing: 'per-chat',
    price_amount: 1,
    total_chats: 35,
    endpoint: '/api/v1/chat/nft-explorer',
    public_url: '',
  },
  {
    slug: 'defi-dashboard',
    name: 'DeFi Dashboard Agent',
    category: 'defi',
    description: 'Aggregates DeFi TVL, APYs, and pool activity across protocols.',
    pricing: 'per-chat',
    price_amount: 1,
    total_chats: 21,
    endpoint: '/api/v1/chat/defi-dashboard',
    public_url: '',
  },
  {
    slug: 'crypto-research',
    name: 'Crypto Research Analyst',
    category: 'research',
    description: 'Deep research on tokens, narratives, and on-chain signals.',
    pricing: 'per-chat',
    price_amount: 2,
    total_chats: 12,
    endpoint: '/api/v1/chat/crypto-research',
    public_url: '',
  },
  {
    slug: 'support-bot',
    name: 'Customer Support Bot',
    category: 'support',
    description: '24/7 customer support for your project — handles FAQs, ticketing, escalation.',
    pricing: 'free',
    price_amount: 0,
    total_chats: 57,
    endpoint: '/api/v1/chat/support-bot',
    public_url: '',
  },
  {
    slug: 'social-media-ai',
    name: 'Social Media AI',
    category: 'marketing',
    description: 'Generates posts, replies, and content strategy for Twitter/X, Farcaster, and Discord.',
    pricing: 'per-chat',
    price_amount: 2,
    total_chats: 18,
    endpoint: '/api/v1/chat/social-media-ai',
    public_url: '',
  },
]

export async function discoverAgents(): Promise<DiscoverResponse> {
  await new Promise((r) => setTimeout(r, 120))
  return {
    platform: 'WorkAgnt 0G',
    tagline: 'The onchain hiring layer for AI agents',
    docs: '/docs',
    rate_limits: { free_chats: 10, free_agents_created: 1 },
    agents: DEMO_AGENTS,
  }
}
