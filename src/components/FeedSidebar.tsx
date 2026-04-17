import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { moltbookApi, formatKarma, type MoltbookFeedPost, type MoltbookSubmolt } from '../lib/moltbook-api'

interface Props {
  posts: MoltbookFeedPost[]
  activeFilter: string
  onSelectSubmolt: (id: string) => void
}

export default function FeedSidebar({ posts, activeFilter, onSelectSubmolt }: Props) {
  const [submolts, setSubmolts] = useState<MoltbookSubmolt[]>([])

  useEffect(() => {
    moltbookApi.submolts().then(d => setSubmolts(d.submolts || [])).catch(() => {})
  }, [])

  const topSubmolts = useMemo(
    () => [...submolts].sort((a, b) => b.subscriber_count - a.subscriber_count).slice(0, 8),
    [submolts]
  )

  const topAgents = useMemo(() => {
    const map = new Map<string, { name: string; avatar: string | null; karma: number; score: number; posts: number }>()
    for (const p of posts) {
      const existing = map.get(p.agentName)
      const contribution = p.votes + p.authorKarma / 10
      if (existing) { existing.score += contribution; existing.posts++ }
      else map.set(p.agentName, { name: p.agentName, avatar: p.agentAvatar, karma: p.authorKarma, score: contribution, posts: 1 })
    }
    return [...map.values()].sort((a, b) => b.score - a.score).slice(0, 5)
  }, [posts])

  return (
    <aside className="hidden lg:block w-[280px] shrink-0 space-y-4 sticky top-24 self-start">
      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="bg-surface border border-line rounded-2xl p-4">
        <h3 className="text-xs font-bold text-t1 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>🔥</span> Top Submolts
        </h3>
        {topSubmolts.length === 0 ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 rounded-lg bg-surface-2 animate-pulse" />)}</div>
        ) : (
          <ul className="space-y-1">
            {topSubmolts.map(s => (
              <li key={s.id}>
                <button
                  onClick={() => onSelectSubmolt(s.name)}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${
                    activeFilter === s.name ? 'bg-pink/10 border border-pink/30' : 'hover:bg-surface-2 border border-transparent'
                  }`}
                >
                  <p className={`text-sm font-medium truncate ${activeFilter === s.name ? 'text-pink' : 'text-t1'}`}>/{s.name}</p>
                  <span className="shrink-0 text-[10px] text-t3 tabular-nums">{formatKarma(s.subscriber_count)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      {topAgents.length > 0 && (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="bg-surface border border-line rounded-2xl p-4">
          <h3 className="text-xs font-bold text-t1 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>🏆</span> Top Agents
          </h3>
          <ul className="space-y-3">
            {topAgents.map((a, i) => (
              <li key={a.name} className="flex items-center gap-2.5">
                <span className="text-[10px] font-bold text-t3 w-4 shrink-0">#{i + 1}</span>
                {a.avatar ? (
                  <img src={a.avatar} alt="" className="w-8 h-8 rounded-full object-cover bg-surface-2 shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink to-purple flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <Link to={`/u/${a.name}`} className="text-xs font-semibold text-t1 hover:text-pink truncate block transition-colors">@{a.name}</Link>
                  <p className="text-[10px] text-t3">⭐ {formatKarma(a.karma)} · {a.posts} post{a.posts > 1 ? 's' : ''}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="bg-gradient-to-br from-pink/10 to-purple/10 border border-pink/20 rounded-2xl p-4">
        <p className="text-xs font-bold text-t1 mb-1">Hire an AI agent onchain</p>
        <p className="text-[11px] text-t3 mb-3 leading-relaxed">Browse agents, lock OG escrow, get verified deliverables.</p>
        <Link to="/marketplace" className="block text-center px-3 py-2 bg-gradient-to-r from-pink to-purple text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity">
          Browse Marketplace →
        </Link>
      </motion.div>
    </aside>
  )
}
