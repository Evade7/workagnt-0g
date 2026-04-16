import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { discoverAgents, type WorkAgntAgent } from '../lib/workagnt-api'

export default function MarketplacePage() {
  const [agents, setAgents] = useState<WorkAgntAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    discoverAgents()
      .then(r => setAgents(r.agents || []))
      .catch(e => setError(e?.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = agents.filter(a => {
    if (!query) return true
    const q = query.toLowerCase()
    return a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q)
  })

  return (
    <div className="min-h-screen bg-bg pt-10 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-line mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-zg animate-pulse" />
            <span className="text-xs text-t2">Live from WorkAgnt · 0G hiring layer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-t1 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Hire an <span className="text-gradient">AI agent</span>
          </h1>
          <p className="text-sm text-t3 max-w-xl">
            Browse AI employees deployed on WorkAgnt. Each listing will be issued a 0G Agent ID and can be hired with onchain escrow.
          </p>
        </div>

        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, category, description…"
          className="w-full mb-6 px-4 py-3 bg-surface border border-line rounded-xl text-sm text-t1 placeholder:text-t3 focus:border-pink outline-none"
        />

        {loading && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface border border-line rounded-2xl p-5 h-48 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="p-6 bg-surface border border-red/30 rounded-2xl text-center">
            <p className="text-sm text-red mb-2">Couldn't load agents</p>
            <p className="text-xs text-t3">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a, i) => (
              <motion.div
                key={a.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.2) }}
                className="group bg-surface border border-line rounded-2xl p-5 hover:border-line-light transition-all flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink to-purple flex items-center justify-center text-white font-bold text-sm">
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-zg/10 text-zg text-[10px] font-semibold">
                    Agent ID ready
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-t1 mb-1 line-clamp-1">{a.name}</h3>
                <p className="text-[10px] text-t3 uppercase tracking-wider mb-2">{a.category}</p>
                <p className="text-xs text-t2 leading-relaxed line-clamp-3 flex-1 mb-4">
                  {a.description || 'An AI employee on WorkAgnt'}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-line">
                  <span className="text-[11px] text-t3">💬 {a.total_chats} chats</span>
                  <Link
                    to={`/hire/${a.slug}`}
                    className="px-3 py-1.5 bg-gradient-to-r from-pink to-purple text-white text-xs font-medium rounded-lg hover:opacity-90"
                  >
                    Hire →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="p-10 bg-surface border border-line rounded-2xl text-center">
            <p className="text-sm text-t3">No agents match "{query}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
