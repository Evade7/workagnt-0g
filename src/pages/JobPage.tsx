import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { formatEther, keccak256, stringToBytes, zeroHash, type Hex } from 'viem'
import { useAccount, useChainId, useReadContract, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'

import { AGNT_MARKETPLACE_ABI, AGNT_MARKETPLACE_ADDRESS, JobStatus, JobStatusLabel } from '../lib/contracts'
import { zgGalileo } from '../lib/wagmi'

function shortAddr(a?: string) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '—'
}

export default function JobPage() {
  const { id } = useParams<{ id: string }>()
  const jobId = id && !id.startsWith('demo-') ? BigInt(id) : undefined

  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { openConnectModal } = useConnectModal()
  const { switchChain } = useSwitchChain()
  const { writeContractAsync, isPending, data: txHash } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash })

  const [rating, setRating] = useState(5)

  const { data: job, refetch } = useReadContract({
    address: AGNT_MARKETPLACE_ADDRESS,
    abi: AGNT_MARKETPLACE_ABI,
    functionName: 'getJob',
    args: jobId !== undefined ? [jobId] : undefined,
    chainId: zgGalileo.id,
    query: { enabled: jobId !== undefined },
  })

  const wrongChain = isConnected && chainId !== zgGalileo.id

  const ensureReady = async () => {
    if (!isConnected) { openConnectModal?.(); return false }
    if (wrongChain) { await switchChain({ chainId: zgGalileo.id }); return false }
    return true
  }

  const handleAccept = async () => {
    if (!(await ensureReady()) || jobId === undefined) return
    await writeContractAsync({
      address: AGNT_MARKETPLACE_ADDRESS,
      abi: AGNT_MARKETPLACE_ABI,
      functionName: 'acceptJob',
      args: [jobId],
      chainId: zgGalileo.id,
    }).catch(console.error)
    setTimeout(() => refetch(), 4000)
  }

  const handleComplete = async () => {
    if (!(await ensureReady()) || jobId === undefined) return
    const hash: Hex = keccak256(stringToBytes(`deliverable:${jobId}:${Date.now()}`))
    await writeContractAsync({
      address: AGNT_MARKETPLACE_ADDRESS,
      abi: AGNT_MARKETPLACE_ABI,
      functionName: 'completeJob',
      args: [jobId, hash],
      chainId: zgGalileo.id,
    }).catch(console.error)
    setTimeout(() => refetch(), 4000)
  }

  const handleApprove = async () => {
    if (!(await ensureReady()) || jobId === undefined) return
    await writeContractAsync({
      address: AGNT_MARKETPLACE_ADDRESS,
      abi: AGNT_MARKETPLACE_ABI,
      functionName: 'approveJob',
      args: [jobId, rating, zeroHash], // blob hash wired in Storage step later
      chainId: zgGalileo.id,
    }).catch(console.error)
    setTimeout(() => refetch(), 4000)
  }

  const handleDispute = async () => {
    if (!(await ensureReady()) || jobId === undefined) return
    await writeContractAsync({
      address: AGNT_MARKETPLACE_ADDRESS,
      abi: AGNT_MARKETPLACE_ABI,
      functionName: 'disputeJob',
      args: [jobId],
      chainId: zgGalileo.id,
    }).catch(console.error)
    setTimeout(() => refetch(), 4000)
  }

  const handleCancel = async () => {
    if (!(await ensureReady()) || jobId === undefined) return
    await writeContractAsync({
      address: AGNT_MARKETPLACE_ADDRESS,
      abi: AGNT_MARKETPLACE_ABI,
      functionName: 'cancelJob',
      args: [jobId],
      chainId: zgGalileo.id,
    }).catch(console.error)
    setTimeout(() => refetch(), 4000)
  }

  if (!jobId) {
    return (
      <div className="min-h-screen bg-bg pt-20 px-4 text-center">
        <p className="text-t3 mb-3">Enter a numeric job id (e.g. /job/1).</p>
        <Link to="/my-jobs" className="text-pink hover:underline text-sm">← My Jobs</Link>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-bg pt-20 px-4 text-center">
        <p className="text-t3">Loading job #{String(jobId)}…</p>
      </div>
    )
  }

  const status = job.status as number
  const isClient = address && address.toLowerCase() === job.client.toLowerCase()
  const isAgentOwner = address && address.toLowerCase() === job.agentOwner.toLowerCase()
  const noAgentYet = job.agentOwner === '0x0000000000000000000000000000000000000000'

  return (
    <div className="min-h-screen bg-bg pt-10 pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/my-jobs" className="text-xs text-t3 hover:text-t1 mb-4 inline-block">← My Jobs</Link>

        <div className="bg-surface border border-line rounded-2xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <p className="text-[10px] text-t3 uppercase tracking-wider">Job #</p>
              <p className="text-sm font-mono text-t1">{String(job.id)}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              status === JobStatus.Posted ? 'bg-amber-500/10 text-amber-500' :
              status === JobStatus.Accepted ? 'bg-blue/10 text-blue' :
              status === JobStatus.Completed ? 'bg-purple/10 text-purple' :
              status === JobStatus.Approved ? 'bg-zg/10 text-zg' :
              status === JobStatus.Disputed ? 'bg-red/10 text-red' :
              status === JobStatus.Cancelled ? 'bg-t3/10 text-t3' :
              'bg-t3/10 text-t3'
            }`}>
              {JobStatusLabel[status] || 'Unknown'}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[10px] text-t3 uppercase tracking-wider mb-1">Agent</p>
              <Link to={`/u/${job.agentSlug}`} className="text-t1 hover:text-pink">@{job.agentSlug}</Link>
            </div>
            <div>
              <p className="text-[10px] text-t3 uppercase tracking-wider mb-1">Budget</p>
              <p className="text-t1 font-mono">{formatEther(job.budget)} OG</p>
            </div>
            <div>
              <p className="text-[10px] text-t3 uppercase tracking-wider mb-1">Client</p>
              <p className="text-t1 font-mono">{shortAddr(job.client)}</p>
            </div>
            <div>
              <p className="text-[10px] text-t3 uppercase tracking-wider mb-1">Agent Owner</p>
              <p className="text-t1 font-mono">{noAgentYet ? 'not accepted yet' : shortAddr(job.agentOwner)}</p>
            </div>
          </div>

          {job.brief && (
            <div className="mt-4 pt-4 border-t border-line">
              <p className="text-[10px] text-t3 uppercase tracking-wider mb-1">Brief</p>
              <p className="text-sm text-t2 whitespace-pre-wrap">{job.brief}</p>
            </div>
          )}

          {job.deliverableHash && job.deliverableHash !== zeroHash && (
            <div className="mt-4 pt-4 border-t border-line">
              <p className="text-[10px] text-t3 uppercase tracking-wider mb-1">Deliverable (0G Storage hash)</p>
              <p className="text-xs font-mono text-t2 break-all">{job.deliverableHash}</p>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div className="p-4 bg-surface border border-line rounded-xl">
            <p className="text-[10px] text-t3 uppercase tracking-wider mb-1">Escrow</p>
            <p className="text-sm text-zg">{formatEther(job.budget)} OG locked</p>
          </div>
          <div className="p-4 bg-surface border border-line rounded-xl">
            <p className="text-[10px] text-t3 uppercase tracking-wider mb-1">Chain</p>
            <p className="text-sm text-zg">0G Galileo testnet</p>
          </div>
          <div className="p-4 bg-surface border border-line rounded-xl">
            <p className="text-[10px] text-t3 uppercase tracking-wider mb-1">Rating</p>
            <p className="text-sm text-zg">{status === JobStatus.Approved ? `${job.rating} / 5 ★` : '—'}</p>
          </div>
        </div>

        {/* Role-based actions */}
        <div className="bg-surface border border-line rounded-2xl p-5">
          <p className="text-[10px] text-t3 uppercase tracking-wider mb-3">Actions</p>

          {/* Agent owner: accept (if open) or complete (if accepted by you) */}
          {status === JobStatus.Posted && noAgentYet && (
            <button
              onClick={handleAccept}
              disabled={isPending || isConfirming}
              className="w-full py-2.5 mb-2 bg-gradient-to-r from-pink to-purple text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-40"
            >
              {isPending || isConfirming ? 'Submitting…' : 'Accept this job'}
            </button>
          )}

          {status === JobStatus.Accepted && isAgentOwner && (
            <button
              onClick={handleComplete}
              disabled={isPending || isConfirming}
              className="w-full py-2.5 mb-2 bg-gradient-to-r from-pink to-purple text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-40"
            >
              {isPending || isConfirming ? 'Submitting…' : 'Submit deliverable'}
            </button>
          )}

          {/* Client: approve (after complete) */}
          {status === JobStatus.Completed && isClient && (
            <div className="space-y-2 mb-2">
              <label className="flex items-center gap-2 text-sm text-t2">
                Rating:
                <select
                  value={rating}
                  onChange={e => setRating(Number(e.target.value))}
                  className="bg-surface-2 border border-line rounded-md px-2 py-1 text-sm text-t1"
                >
                  {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} ★</option>)}
                </select>
              </label>
              <button
                onClick={handleApprove}
                disabled={isPending || isConfirming}
                className="w-full py-2.5 bg-gradient-to-r from-pink to-purple text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-40"
              >
                {isPending || isConfirming ? 'Releasing…' : `Approve & release ${formatEther(job.budget)} OG`}
              </button>
            </div>
          )}

          {/* Both parties: dispute after complete */}
          {status === JobStatus.Completed && (isClient || isAgentOwner) && (
            <button
              onClick={handleDispute}
              disabled={isPending || isConfirming}
              className="w-full py-2 bg-surface-2 border border-line text-t2 hover:text-red hover:border-red/50 text-xs rounded-lg transition-colors"
            >
              Flag dispute
            </button>
          )}

          {/* Client: cancel if still Posted (and no acceptance yet) */}
          {status === JobStatus.Posted && isClient && (
            <button
              onClick={handleCancel}
              disabled={isPending || isConfirming}
              className="w-full py-2 bg-surface-2 border border-line text-t2 hover:text-red hover:border-red/50 text-xs rounded-lg transition-colors mt-2"
            >
              Cancel & refund
            </button>
          )}

          {/* Not connected or not a party */}
          {!isConnected && (
            <p className="text-xs text-t3 text-center py-2">Connect your wallet to see available actions.</p>
          )}

          {isConnected && !isClient && !isAgentOwner && status !== JobStatus.Posted && (
            <p className="text-xs text-t3 text-center py-2">You're not a party to this job.</p>
          )}
        </div>

        {/* 0G Compute chat CTA */}
        <div className="mt-4 p-5 bg-surface border border-line rounded-2xl text-center">
          <p className="text-sm text-t3 mb-3">Chat with the agent via 0G Compute (TEE-verified)</p>
          <a
            href="https://compute-marketplace.0g.ai/inference"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-gradient-to-r from-pink to-purple text-white text-sm font-medium rounded-lg hover:opacity-90"
          >
            Open 0G Compute ↗
          </a>
        </div>
      </div>
    </div>
  )
}
