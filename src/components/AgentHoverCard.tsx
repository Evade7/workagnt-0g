import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { moltbookApi, formatKarma, type MoltbookAgentProfile } from '../lib/moltbook-api'

interface AgentPreview {
  name: string
  avatar: string | null
  karma: number
  postsInFeed: number
}

interface Props {
  agent: AgentPreview
  children: React.ReactNode
}

const cache = new Map<string, { data: MoltbookAgentProfile; expires: number }>()

export default function AgentHoverCard({ agent, children }: Props) {
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<MoltbookAgentProfile | null>(() => {
    const c = cache.get(agent.name)
    return c && c.expires > Date.now() ? c.data : null
  })
  const timerRef = useRef<number | null>(null)

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current) }, [])

  useEffect(() => {
    if (!open || profile) return
    const c = cache.get(agent.name)
    if (c && c.expires > Date.now()) { setProfile(c.data); return }
    moltbookApi.agent(agent.name).then(data => {
      cache.set(agent.name, { data, expires: Date.now() + 5 * 60 * 1000 })
      setProfile(data)
    }).catch(() => {})
  }, [open, agent.name, profile])

  const show = () => { if (timerRef.current) clearTimeout(timerRef.current); timerRef.current = window.setTimeout(() => setOpen(true), 150) }
  const hide = () => { if (timerRef.current) clearTimeout(timerRef.current); timerRef.current = window.setTimeout(() => setOpen(false), 120) }

  return (
    <span className="relative inline-block" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="hidden sm:block absolute z-50 top-full left-0 mt-2 w-72 bg-surface border border-line rounded-2xl shadow-2xl shadow-black/30 p-4"
            onMouseEnter={show}
            onMouseLeave={hide}
          >
            <div className="flex items-center gap-3 mb-3">
              {agent.avatar ? (
                <img src={agent.avatar} alt="" className="w-12 h-12 rounded-full object-cover bg-surface-2" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink to-purple flex items-center justify-center text-white text-base font-bold">
                  {agent.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-t1 truncate flex items-center gap-1">
                  @{agent.name}
                  {profile?.agent?.verified && <span className="text-blue text-xs" title="X-verified">✓</span>}
                </p>
                <p className="text-[11px] text-t3 line-clamp-1">{profile?.agent?.description || 'AI agent'}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-surface-2 rounded-lg p-2 text-center">
                <p className="text-[10px] text-t3 uppercase tracking-wider">Karma</p>
                <p className="text-sm font-bold text-amber-500">⭐ {formatKarma(profile?.agent?.karma ?? agent.karma)}</p>
              </div>
              <div className="bg-surface-2 rounded-lg p-2 text-center">
                <p className="text-[10px] text-t3 uppercase tracking-wider">Followers</p>
                <p className="text-sm font-bold text-t1">{profile?.agent ? formatKarma(profile.agent.followerCount) : '…'}</p>
              </div>
              <div className="bg-surface-2 rounded-lg p-2 text-center">
                <p className="text-[10px] text-t3 uppercase tracking-wider">In Feed</p>
                <p className="text-sm font-bold text-t1">{agent.postsInFeed}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={`/u/${agent.name}`} className="flex-1 text-center px-2 py-1.5 bg-surface-2 hover:bg-line text-t1 text-[11px] font-medium rounded-lg transition-colors">
                View Profile
              </a>
              <a href={`/hire/${agent.name}`} className="flex-1 text-center px-2 py-1.5 bg-gradient-to-r from-pink to-purple text-white text-[11px] font-medium rounded-lg hover:opacity-90 transition-opacity">
                Hire Onchain
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
