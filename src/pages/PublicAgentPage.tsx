import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { formatEther, zeroHash } from 'viem'
import { useAccount, useReadContract } from 'wagmi'
import { motion } from 'framer-motion'
import { AGNT_MARKETPLACE_ABI, AGNT_MARKETPLACE_ADDRESS } from '../lib/contracts'
import { zgGalileo } from '../lib/wagmi'
import { useEthersSigner } from '../lib/ethers-adapter'
import { inferenceWith0G } from '../lib/zg-compute'

interface ChatMsg { role: 'user' | 'assistant'; content: string; verified?: boolean }

export default function PublicAgentPage() {
  const { slug } = useParams<{ slug: string }>()
  const { isConnected } = useAccount()
  const ethersSigner = useEthersSigner({ chainId: zgGalileo.id })

  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const { data: agentId } = useReadContract({
    address: AGNT_MARKETPLACE_ADDRESS,
    abi: AGNT_MARKETPLACE_ABI,
    functionName: 'agentIdBySlug',
    args: slug ? [slug] : undefined,
    chainId: zgGalileo.id,
    query: { enabled: Boolean(slug) },
  })

  const { data: agent } = useReadContract({
    address: AGNT_MARKETPLACE_ADDRESS,
    abi: AGNT_MARKETPLACE_ABI,
    functionName: 'getAgent',
    args: agentId && agentId > 0n ? [agentId] : undefined,
    chainId: zgGalileo.id,
    query: { enabled: Boolean(agentId && agentId > 0n) },
  })

  const { data: reputation } = useReadContract({
    address: AGNT_MARKETPLACE_ADDRESS,
    abi: AGNT_MARKETPLACE_ABI,
    functionName: 'getAgentReputation',
    args: slug ? [slug] : undefined,
    chainId: zgGalileo.id,
    query: { enabled: Boolean(slug) },
  })

  const onchainHires = reputation ? Number(reputation[0]) : 0
  const avgRating = reputation ? Number(reputation[4]) / 100 : 0
  const totalEarned = reputation ? reputation[2] : 0n
  const isRegistered = agentId && agentId > 0n

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setChatLoading(true)

    const systemPrompt = agent
      ? `You are ${(agent as any).name}, an AI agent. ${(agent as any).description}. Category: ${(agent as any).category}. Respond helpfully and concisely.`
      : `You are an AI agent called ${slug}. Respond helpfully.`

    const result = await inferenceWith0G(`${systemPrompt}\n\nUser: ${userMsg}`, { signer: ethersSigner })
    setMessages(prev => [...prev, { role: 'assistant', content: result.reply, verified: result.verified }])
    setChatLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg pt-10 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/marketplace" className="text-xs text-t3 hover:text-t1 mb-4 inline-block">← Marketplace</Link>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Agent Profile */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-line rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #9200E1, #B75FFF)' }}>
                  {(slug || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-bold text-t1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {agent ? (agent as any).name : slug}
                  </h1>
                  <p className="text-[11px] text-t3 uppercase tracking-wider">{agent ? (agent as any).category : 'agent'}</p>
                  {isRegistered && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: '#9200E115', color: '#9200E1' }}>
                      🪪 Agentic ID #{String(agentId)}
                    </span>
                  )}
                </div>
              </div>

              {agent && (agent as any).description && (
                <p className="text-sm text-t2 leading-relaxed mb-4">{(agent as any).description}</p>
              )}

              {!isRegistered && (
                <p className="text-xs text-t3 italic">This agent is not registered onchain yet.</p>
              )}
            </motion.div>

            {/* Reputation */}
            <div className="bg-surface border border-line rounded-2xl p-5">
              <h3 className="text-xs font-bold text-t3 uppercase tracking-wider mb-3">Onchain Reputation</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[9px] text-t3 uppercase">Hires</p>
                  <p className="text-lg font-bold text-t1">{onchainHires}</p>
                </div>
                <div>
                  <p className="text-[9px] text-t3 uppercase">Rating</p>
                  <p className="text-lg font-bold text-amber-500">{onchainHires > 0 ? avgRating.toFixed(1) + '★' : '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-t3 uppercase">Earned</p>
                  <p className="text-lg font-bold text-t1">{formatEther(totalEarned)} OG</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link to={`/hire/${slug}`} className="flex-1 py-2.5 text-center text-white text-sm font-medium rounded-lg hover:opacity-90" style={{ background: 'linear-gradient(to right, #9200E1, #B75FFF)' }}>
                Hire onchain →
              </Link>
              <Link to={`/u/${slug}`} className="flex-1 py-2.5 text-center bg-surface border border-line text-t1 text-sm font-medium rounded-lg hover:border-line-light">
                Full Profile
              </Link>
            </div>
          </div>

          {/* Right: Chat via 0G Compute */}
          <div className="lg:col-span-3">
            <div className="bg-surface border border-line rounded-2xl overflow-hidden flex flex-col" style={{ height: '520px' }}>
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-line flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/0g-logo.png" alt="0G" className="w-4 h-4" />
                  <span className="text-sm font-semibold text-t1">Chat via 0G Compute</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold" style={{ background: '#9200E115', color: '#9200E1' }}>
                  TEE-Verified · Qwen 2.5 7B
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-t3 mb-2">Chat with {agent ? (agent as any).name : slug}</p>
                      <p className="text-xs text-t3">Inference runs inside a 0G Compute TEE.<br />Responses are cryptographically verified.</p>
                      {!isConnected && <p className="text-xs text-zg mt-3">Connect wallet to enable TEE chat.</p>}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-white rounded-br-md'
                        : 'bg-surface-2 border border-line text-t1 rounded-bl-md'
                    }`} style={msg.role === 'user' ? { background: 'linear-gradient(to right, #9200E1, #B75FFF)' } : undefined}>
                      {msg.content}
                      {msg.role === 'assistant' && (
                        <span className={`block mt-1 text-[10px] ${msg.verified ? 'text-green' : 'text-t3'}`}>
                          {msg.verified ? '✓ TEE Verified' : '⚠ Fallback (connect wallet for TEE)'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 bg-surface-2 border border-line rounded-2xl rounded-bl-md flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-t3 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-t3 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-t3 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-line">
                <form onSubmit={e => { e.preventDefault(); handleSend() }} className="flex gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={isConnected ? 'Message this agent via 0G Compute…' : 'Connect wallet to chat'}
                    className="flex-1 px-3 py-2.5 bg-bg border border-line rounded-xl text-sm text-t1 placeholder:text-t3 focus:border-zg outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || chatLoading}
                    className="px-4 py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-40 shrink-0"
                    style={{ background: 'linear-gradient(to right, #9200E1, #B75FFF)' }}
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
