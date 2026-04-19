import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePublicClient, useReadContract } from 'wagmi'
import { discoverAgents, type WorkAgntAgent } from '../lib/workagnt-api'
import { AGNT_MARKETPLACE_ABI, AGNT_MARKETPLACE_ADDRESS } from '../lib/contracts'
import { zgGalileo } from '../lib/wagmi'

interface OnchainAgent {
  slug: string
  name: string
  description: string
  category: string
  owner: string
  onchain: true
}

export default function MarketplacePage() {
  const [demoAgents, setDemoAgents] = useState<WorkAgntAgent[]>([])
  const [onchainAgents, setOnchainAgents] = useState<OnchainAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const publicClient = usePublicClient({ chainId: zgGalileo.id })
  const { data: agentCount } = useReadContract({
    address: AGNT_MARKETPLACE_ADDRESS,
    abi: AGNT_MARKETPLACE_ABI,
    functionName: 'agentCount',
    chainId: zgGalileo.id,
    query: { refetchInterval: 15000 },
  })

  useEffect(() => {
    discoverAgents()
      .then(r => setDemoAgents(r.agents || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!publicClient || !agentCount) return
    const n = Number(agentCount)
    if (n === 0) return
    ;(async () => {
      const results: OnchainAgent[] = []
      for (let i = 1; i <= n; i++) {
        try {
          const agent = await publicClient.readContract({
            address: AGNT_MARKETPLACE_ADDRESS,
            abi: AGNT_MARKETPLACE_ABI,
            functionName: 'getAgent',
            args: [BigInt(i)],
          }) as any
          if (agent && agent.slug) {
            results.push({
              slug: agent.slug,
              name: agent.name || agent.slug,
              description: agent.description || '',
              category: agent.category || 'other',
              owner: agent.owner,
              onchain: true,
            })
          }
        } catch {}
      }
      setOnchainAgents(results)
    })()
  }, [publicClient, agentCount])

  const allAgents = [
    ...onchainAgents.map(a => ({ ...a, total_chats: 0, onchain: true as const })),
    ...demoAgents.map(a => ({ ...a, onchain: false as const })),
  ]

  const filtered = allAgents.filter(a => {
    if (!query) return true
    const q = query.toLowerCase()
    return a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q)
  })

  return (
    <div className="min-h-screen bg-bg pt-10 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-line mb-4">
            <img src="/0g-logo.png" alt="0G" className="w-4 h-4" />
            <span className="text-xs text-t2">Agents on 0G Chain</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-t1 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Discover <span className="text-gradient-zg">AI agents</span>
          </h1>
          <p className="text-sm text-t3 max-w-xl">
            Browse registered agents with Agentic ID NFTs. Any agent can register — permissionless, onchain, from any framework.
          </p>
          {onchainAgents.length > 0 && (
            <p className="text-xs text-zg mt-2 font-medium">{onchainAgents.length} agent{onchainAgents.length > 1 ? 's' : ''} registered onchain</p>
          )}
        </div>

        <div className="flex gap-3 mb-6">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, category, description…"
            className="flex-1 px-4 py-3 bg-surface border border-line rounded-xl text-sm text-t1 placeholder:text-t3 focus:border-zg outline-none"
          />
          <Link
            to="/register"
            className="shrink-0 px-4 py-3 text-white text-sm font-medium rounded-xl hover:opacity-90"
            style={{ background: 'linear-gradient(to right, #9200E1, #B75FFF)' }}
          >
            + Register Agent
          </Link>
        </div>

        {loading && onchainAgents.length === 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface border border-line rounded-2xl p-5 h-48 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a, i) => (
              <motion.div
                key={`${a.onchain ? 'on' : 'off'}-${a.slug}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.2) }}
                className="group bg-surface border border-line rounded-2xl p-5 hover:border-zg/30 transition-all flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple to-pink flex items-center justify-center text-white font-bold text-sm" style={a.onchain ? { background: 'linear-gradient(135deg, #9200E1, #B75FFF)' } : undefined}>
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {a.onchain ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: '#9200E115', color: '#9200E1' }}>
                        🪪 Agentic ID
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-surface-2 text-t3 text-[10px] font-semibold">
                        Demo
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-t1 mb-1 line-clamp-1">{a.name}</h3>
                <p className="text-[10px] text-t3 uppercase tracking-wider mb-2">{a.category}</p>
                <p className="text-xs text-t2 leading-relaxed line-clamp-3 flex-1 mb-4">
                  {a.description || 'An AI agent on WorkAgnt 0G'}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-line">
                  {a.onchain && 'owner' in a ? (
                    <span className="text-[10px] text-t3 font-mono">{(a as OnchainAgent).owner.slice(0, 6)}…{(a as OnchainAgent).owner.slice(-4)}</span>
                  ) : (
                    <span className="text-[11px] text-t3">💬 {(a as any).total_chats || 0} chats</span>
                  )}
                  <div className="flex gap-1.5">
                    <Link to={`/e/${a.slug}`} className="px-2.5 py-1.5 bg-surface-2 text-t1 text-xs font-medium rounded-lg hover:bg-line transition-colors">
                      View
                    </Link>
                    <Link
                      to={`/hire/${a.slug}`}
                      className="px-2.5 py-1.5 text-white text-xs font-medium rounded-lg hover:opacity-90"
                      style={{ background: 'linear-gradient(to right, #9200E1, #B75FFF)' }}
                    >
                      Hire →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-10 bg-surface border border-line rounded-2xl text-center">
            <p className="text-sm text-t3 mb-3">{query ? `No agents match "${query}"` : 'No agents yet.'}</p>
            <Link to="/register" className="text-sm text-zg hover:opacity-80 font-medium">Register the first agent →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
