import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { formatEther } from 'viem'
import { useAccount, usePublicClient, useReadContract } from 'wagmi'

import { AGNT_MARKETPLACE_ABI, AGNT_MARKETPLACE_ADDRESS, JobStatus, JobStatusLabel } from '../lib/contracts'
import { zgGalileo } from '../lib/wagmi'

interface Job {
  id: bigint
  client: `0x${string}`
  agentOwner: `0x${string}`
  agentSlug: string
  brief: string
  budget: bigint
  status: number
  deliverableHash: `0x${string}`
  rating: number
  createdAt: bigint
  acceptedAt: bigint
  completedAt: bigint
  approvedAt: bigint
}

function statusPillClass(status: number) {
  switch (status) {
    case JobStatus.Posted: return 'bg-amber-500/10 text-amber-500'
    case JobStatus.Accepted: return 'bg-blue/10 text-blue'
    case JobStatus.Completed: return 'bg-purple/10 text-purple'
    case JobStatus.Approved: return 'bg-zg/10 text-zg'
    case JobStatus.Disputed: return 'bg-red/10 text-red'
    case JobStatus.Cancelled: return 'bg-t3/10 text-t3'
    default: return 'bg-t3/10 text-t3'
  }
}

export default function MyJobsPage() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient({ chainId: zgGalileo.id })
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)

  const { data: jobCount } = useReadContract({
    address: AGNT_MARKETPLACE_ADDRESS,
    abi: AGNT_MARKETPLACE_ABI,
    functionName: 'jobCount',
    chainId: zgGalileo.id,
    query: { refetchInterval: 15000 },
  })

  useEffect(() => {
    if (!isConnected || !address || !publicClient || !jobCount) return
    const n = Number(jobCount)
    if (n === 0) { setJobs([]); return }

    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const calls = Array.from({ length: n }, (_, i) => BigInt(i + 1)).map(id =>
          publicClient.readContract({
            address: AGNT_MARKETPLACE_ADDRESS,
            abi: AGNT_MARKETPLACE_ABI,
            functionName: 'getJob',
            args: [id],
          })
        )
        const results = await Promise.all(calls)
        if (cancelled) return
        const me = address.toLowerCase()
        const mine = (results as unknown as Job[]).filter(
          j => j.client.toLowerCase() === me || j.agentOwner.toLowerCase() === me
        )
        setJobs(mine)
      } catch (e) {
        console.error('MyJobs fetch error', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [isConnected, address, publicClient, jobCount])

  const asClient = useMemo(
    () => jobs.filter(j => address && j.client.toLowerCase() === address.toLowerCase()),
    [jobs, address]
  )
  const asAgentOwner = useMemo(
    () => jobs.filter(j => address && j.agentOwner.toLowerCase() === address.toLowerCase() && j.client.toLowerCase() !== address.toLowerCase()),
    [jobs, address]
  )

  return (
    <div className="min-h-screen bg-bg pt-10 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-t1 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          My <span className="text-gradient">Jobs</span>
        </h1>
        <p className="text-sm text-t3 mb-8">Jobs read directly from 0G Chain via your connected wallet.</p>

        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <div className="p-4 bg-surface border border-line rounded-xl">
            <p className="text-[10px] text-t3 uppercase tracking-wider mb-1">As Client</p>
            <p className="text-2xl font-bold text-t1">{asClient.length}</p>
            <p className="text-[10px] text-t3">Jobs you've posted</p>
          </div>
          <div className="p-4 bg-surface border border-line rounded-xl">
            <p className="text-[10px] text-t3 uppercase tracking-wider mb-1">As Agent Owner</p>
            <p className="text-2xl font-bold text-t1">{asAgentOwner.length}</p>
            <p className="text-[10px] text-t3">Jobs your agents are doing</p>
          </div>
        </div>

        {!isConnected && (
          <div className="p-10 bg-surface border border-line rounded-2xl text-center">
            <p className="text-sm text-t3 mb-2">Connect your wallet to see jobs</p>
            <p className="text-xs text-t3">Reads from contract {AGNT_MARKETPLACE_ADDRESS.slice(0, 10)}… on 0G Galileo</p>
          </div>
        )}

        {isConnected && loading && (
          <div className="p-10 bg-surface border border-line rounded-2xl text-center">
            <p className="text-sm text-t3">Loading jobs from chain…</p>
          </div>
        )}

        {isConnected && !loading && jobs.length === 0 && (
          <div className="p-10 bg-surface border border-line rounded-2xl text-center">
            <p className="text-sm text-t3 mb-2">No jobs yet.</p>
            <Link to="/marketplace" className="text-pink hover:text-pink/80 text-sm">Browse agents →</Link>
          </div>
        )}

        {isConnected && !loading && jobs.length > 0 && (
          <div className="space-y-3">
            {jobs.map(j => (
              <Link
                key={String(j.id)}
                to={`/job/${String(j.id)}`}
                className="block p-4 bg-surface border border-line rounded-xl hover:border-line-light transition-colors"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-mono text-t3 shrink-0">#{String(j.id)}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-t1 truncate">@{j.agentSlug}</p>
                      {j.brief && <p className="text-xs text-t3 truncate">{j.brief}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-t2 font-mono">{formatEther(j.budget)} OG</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusPillClass(j.status)}`}>
                      {JobStatusLabel[j.status]}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
