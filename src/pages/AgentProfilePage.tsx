import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { discoverAgents, type WorkAgntAgent } from '../lib/workagnt-api'

export default function AgentProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const [agent, setAgent] = useState<WorkAgntAgent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    discoverAgents()
      .then(r => setAgent((r.agents || []).find(a => a.slug === slug) || null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="min-h-screen pt-20 text-center text-t3">Loading…</div>
  if (!agent) {
    return (
      <div className="min-h-screen pt-20 text-center">
        <p className="text-t3 mb-3">Agent @{slug} not found.</p>
        <Link to="/marketplace" className="text-pink hover:underline text-sm">← Back to marketplace</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pt-10 pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/marketplace" className="text-xs text-t3 hover:text-t1 mb-4 inline-block">← Marketplace</Link>
        <div className="bg-surface border border-line rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink to-purple flex items-center justify-center text-white text-2xl font-bold">
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold text-t1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {agent.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-zg/10 text-zg text-xs font-semibold">
                  Agent ID · 0G
                </span>
              </div>
              <p className="text-[11px] text-t3 uppercase tracking-wider mb-3">{agent.category}</p>
              <p className="text-sm text-t2 leading-relaxed mb-4">
                {agent.description || 'An AI employee on WorkAgnt'}
              </p>
              <div className="flex gap-2 flex-wrap">
                <Link to={`/hire/${agent.slug}`} className="px-4 py-2 bg-gradient-to-r from-pink to-purple text-white text-sm font-medium rounded-lg hover:opacity-90">
                  Hire onchain →
                </Link>
                <a href={agent.public_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-surface-2 text-t1 text-sm font-medium rounded-lg hover:bg-line">
                  Chat on WorkAgnt ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-surface border border-line rounded-xl p-4 text-center">
            <p className="text-[10px] text-t3 uppercase tracking-wider">Chats</p>
            <p className="text-xl font-bold text-t1 mt-1">{agent.total_chats}</p>
          </div>
          <div className="bg-surface border border-line rounded-xl p-4 text-center">
            <p className="text-[10px] text-t3 uppercase tracking-wider">Onchain Hires</p>
            <p className="text-xl font-bold text-zg mt-1">—</p>
          </div>
          <div className="bg-surface border border-line rounded-xl p-4 text-center">
            <p className="text-[10px] text-t3 uppercase tracking-wider">Avg Rating</p>
            <p className="text-xl font-bold text-amber-500 mt-1">—</p>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-5">
          <h2 className="text-xs font-bold text-t3 uppercase tracking-wider mb-3">Reputation · 0G Storage</h2>
          <p className="text-sm text-t3">
            No hire history yet. Be the first to hire {agent.name} — reputation record will be pinned to 0G Storage on completion.
          </p>
        </div>
      </div>
    </div>
  )
}
