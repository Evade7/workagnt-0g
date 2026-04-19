import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { parseEther } from 'viem'
import { useAccount, useChainId, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'

import { discoverAgents, type WorkAgntAgent } from '../lib/workagnt-api'
import { AGNT_MARKETPLACE_ABI, AGNT_MARKETPLACE_ADDRESS } from '../lib/contracts'
import { zgGalileo } from '../lib/wagmi'

export default function HirePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [agent, setAgent] = useState<WorkAgntAgent | null>(null)
  const [brief, setBrief] = useState('')
  const [budget, setBudget] = useState('0.01')

  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { openConnectModal } = useConnectModal()
  const { switchChain } = useSwitchChain()
  const { writeContractAsync, isPending, data: txHash, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash })

  useEffect(() => {
    discoverAgents().then(r => setAgent((r.agents || []).find(a => a.slug === slug) || null))
  }, [slug])

  useEffect(() => {
    if (isConfirmed && txHash) {
      // Contract auto-increments jobCount; we don't know the exact id client-side without a read.
      // Route to a pending jobs view; the user can find their job in MyJobs.
      navigate('/my-jobs')
    }
  }, [isConfirmed, txHash, navigate])

  const wrongChain = isConnected && chainId !== zgGalileo.id

  const handleHire = async () => {
    if (!agent) return
    if (!isConnected) return openConnectModal?.()
    if (wrongChain) return switchChain({ chainId: zgGalileo.id })

    try {
      await writeContractAsync({
        address: AGNT_MARKETPLACE_ADDRESS,
        abi: AGNT_MARKETPLACE_ABI,
        functionName: 'postJob',
        args: [agent.slug, brief],
        value: parseEther(budget || '0'),
        chainId: zgGalileo.id,
      })
    } catch (e) {
      // wagmi surfaces the error; keep the try/catch so we don't unhandled-reject
      console.error('postJob failed', e)
    }
  }

  if (!agent) return <div className="min-h-screen pt-20 text-center text-t3">Loading…</div>

  const buttonLabel = !isConnected
    ? 'Connect wallet →'
    : wrongChain
      ? 'Switch to 0G Galileo'
      : isPending
        ? 'Awaiting signature…'
        : isConfirming
          ? 'Confirming on chain…'
          : `Hire for ${budget} OG →`

  return (
    <div className="min-h-screen bg-bg pt-10 pb-20 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <Link to={`/u/${agent.slug}`} className="text-xs text-t3 hover:text-t1 mb-4 inline-block">← {agent.name}</Link>

        <div className="bg-surface border border-line rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-t1 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Hire {agent.name}
          </h1>
          <p className="text-sm text-t3 mb-6">
            Native OG escrow locks on 0G Chain. Released when you approve the deliverable.
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
            <span className="text-xs font-bold text-t2 uppercase tracking-wider mb-1.5 block">Budget (OG)</span>
            <input
              value={budget}
              onChange={e => setBudget(e.target.value)}
              type="number"
              min="0"
              step="0.001"
              className="w-full px-3 py-2.5 bg-surface-2 border border-line rounded-xl text-sm text-t1 focus:border-pink outline-none"
            />
            <p className="text-[10px] text-t3 mt-1">Tip: keep it small on testnet. 0.01 OG is plenty.</p>
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
            disabled={(!brief.trim() && isConnected && !wrongChain) || isPending || isConfirming}
            className="w-full py-3 bg-gradient-to-r from-pink to-purple text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-40"
          >
            {buttonLabel}
          </button>

          {writeError && (
            <p className="text-xs text-red mt-3 break-words">{writeError.message.split('\n')[0]}</p>
          )}
          {txHash && (
            <p className="text-xs text-t3 mt-3 break-all">
              Tx:{' '}
              <a
                href={`https://explorer.0g.ai/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink hover:text-pink/80 underline"
              >
                {txHash.slice(0, 10)}…{txHash.slice(-8)}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
