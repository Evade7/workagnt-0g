import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { discoverAgents, type WorkAgntAgent } from '../lib/workagnt-api'

export default function HirePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [agent, setAgent] = useState<WorkAgntAgent | null>(null)
  const [brief, setBrief] = useState('')
  const [budget, setBudget] = useState('10')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    discoverAgents().then(r => setAgent((r.agents || []).find(a => a.slug === slug) || null))
  }, [slug])

  const handleHire = async () => {
    setSubmitting(true)
    // TODO: wagmi writeContract → AgntMarketplace.postJob
    await new Promise(r => setTimeout(r, 800))
    setSubmitting(false)
    alert('Onchain escrow coming soon — contract deployment pending.')
    navigate(`/job/demo-${Date.now()}`)
  }

  if (!agent) return <div className="min-h-screen pt-20 text-center text-t3">Loading…</div>

  return (
    <div className="min-h-screen bg-bg pt-10 pb-20 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <Link to={`/u/${agent.slug}`} className="text-xs text-t3 hover:text-t1 mb-4 inline-block">← {agent.name}</Link>

        <div className="bg-surface border border-line rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-t1 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Hire {agent.name}
          </h1>
          <p className="text-sm text-t3 mb-6">
            Escrow locks on 0G Chain. Released when you approve the deliverable.
          </p>

          <label className="block mb-4">
            <span className="text-xs font-bold text-t2 uppercase tracking-wider mb-1.5 block">Job Brief</span>
            <textarea
              value={brief}
              onChange={e => setBrief(e.target.value)}
              rows={4}
              placeholder="Describe what you want the agent to do…"
              className="w-full px-3 py-2.5 bg-surface-2 border border-line rounded-xl text-sm text-t1 placeholder:text-t3 focus:border-pink outline-none resize-none"
            />
          </label>

          <label className="block mb-6">
            <span className="text-xs font-bold text-t2 uppercase tracking-wider mb-1.5 block">Budget (test token)</span>
            <input
              value={budget}
              onChange={e => setBudget(e.target.value)}
              type="number"
              className="w-full px-3 py-2.5 bg-surface-2 border border-line rounded-xl text-sm text-t1 focus:border-pink outline-none"
            />
          </label>

          <div className="p-3 bg-zg/5 border border-zg/20 rounded-xl mb-4 text-xs text-t2 leading-relaxed">
            <p className="font-semibold text-zg mb-1">What happens next</p>
            1. Funds lock in AgntMarketplace on <span className="text-zg">0G Chain</span><br />
            2. Agent owner (Agentic ID holder) accepts the job<br />
            3. Chat inference runs via <span className="text-zg">0G Compute (TEE-private)</span><br />
            4. Approve → funds release → reputation pinned to <span className="text-zg">0G Storage</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="p-2 bg-surface-2 border border-line rounded-lg text-center">
              <p className="text-[9px] text-t3 uppercase tracking-wider">Identity</p>
              <p className="text-[11px] text-zg font-medium">Agentic ID</p>
            </div>
            <div className="p-2 bg-surface-2 border border-line rounded-lg text-center">
              <p className="text-[9px] text-t3 uppercase tracking-wider">Escrow</p>
              <p className="text-[11px] text-zg font-medium">0G Chain</p>
            </div>
            <div className="p-2 bg-surface-2 border border-line rounded-lg text-center">
              <p className="text-[9px] text-t3 uppercase tracking-wider">Inference</p>
              <p className="text-[11px] text-zg font-medium">0G Compute</p>
            </div>
          </div>

          <button
            onClick={handleHire}
            disabled={!brief.trim() || submitting}
            className="w-full py-3 bg-gradient-to-r from-pink to-purple text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-40"
          >
            {submitting ? 'Locking escrow…' : `Hire for ${budget} tokens →`}
          </button>
        </div>
      </div>
    </div>
  )
}
