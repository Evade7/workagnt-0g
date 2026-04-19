import { useEffect, useState } from 'react'
import { formatEther, parseEther } from 'viem'
import { useAccount, usePublicClient, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { motion } from 'framer-motion'
import { AGNT_MARKETPLACE_ABI, AGNT_MARKETPLACE_ADDRESS } from '../lib/contracts'
import { zgGalileo } from '../lib/wagmi'

interface ListedAgent {
  id: bigint
  slug: string
  name: string
  description: string
  category: string
  owner: string
  price: bigint
}

export default function TradePage() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient({ chainId: zgGalileo.id })
  const [listed, setListed] = useState<ListedAgent[]>([])
  const [allAgents, setAllAgents] = useState<ListedAgent[]>([])
  const [loading, setLoading] = useState(true)

  const { writeContractAsync, isPending, data: txHash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const { data: agentCount } = useReadContract({
    address: AGNT_MARKETPLACE_ADDRESS,
    abi: AGNT_MARKETPLACE_ABI,
    functionName: 'agentCount',
    chainId: zgGalileo.id,
    query: { refetchInterval: 10000 },
  })

  useEffect(() => {
    if (!publicClient || !agentCount) return
    const n = Number(agentCount)
    if (n === 0) { setLoading(false); return }

    ;(async () => {
      const agents: ListedAgent[] = []
      for (let i = 1; i <= n; i++) {
        try {
          const [agent, price, owner] = await Promise.all([
            publicClient.readContract({ address: AGNT_MARKETPLACE_ADDRESS, abi: AGNT_MARKETPLACE_ABI, functionName: 'getAgent', args: [BigInt(i)] }),
            publicClient.readContract({ address: AGNT_MARKETPLACE_ADDRESS, abi: AGNT_MARKETPLACE_ABI, functionName: 'agentPrice', args: [BigInt(i)] }),
            publicClient.readContract({ address: AGNT_MARKETPLACE_ADDRESS, abi: AGNT_MARKETPLACE_ABI, functionName: 'ownerOf', args: [BigInt(i)] }),
          ])
          const a = agent as any
          agents.push({
            id: BigInt(i),
            slug: a.slug,
            name: a.name || a.slug,
            description: a.description || '',
            category: a.category || '',
            owner: owner as string,
            price: price as bigint,
          })
        } catch {}
      }
      setAllAgents(agents)
      setListed(agents.filter(a => a.price > 0n))
      setLoading(false)
    })()
  }, [publicClient, agentCount, isSuccess])

  const myAgents = allAgents.filter(a => address && a.owner.toLowerCase() === address.toLowerCase())

  const handleBuy = async (agentId: bigint, price: bigint) => {
    await writeContractAsync({
      address: AGNT_MARKETPLACE_ADDRESS,
      abi: AGNT_MARKETPLACE_ABI,
      functionName: 'buyAgent',
      args: [agentId],
      value: price,
      chainId: zgGalileo.id,
    }).catch(console.error)
  }

  const [listPrice, setListPrice] = useState('')
  const [listingId, setListingId] = useState<bigint | null>(null)

  const handleList = async (agentId: bigint) => {
    if (!listPrice) return
    await writeContractAsync({
      address: AGNT_MARKETPLACE_ADDRESS,
      abi: AGNT_MARKETPLACE_ABI,
      functionName: 'listAgentForSale',
      args: [agentId, parseEther(listPrice)],
      chainId: zgGalileo.id,
    }).catch(console.error)
    setListingId(null)
    setListPrice('')
  }

  const handleDelist = async (agentId: bigint) => {
    await writeContractAsync({
      address: AGNT_MARKETPLACE_ADDRESS,
      abi: AGNT_MARKETPLACE_ABI,
      functionName: 'delistAgent',
      args: [agentId],
      chainId: zgGalileo.id,
    }).catch(console.error)
  }

  return (
    <div className="min-h-screen bg-bg pt-10 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-line mb-4">
            <span className="text-xs text-t2">🪪 Agentic ID Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-t1 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Trade <span className="text-gradient-zg">AI agents</span>
          </h1>
          <p className="text-sm text-t3 max-w-xl">
            Buy and sell AI agents as NFTs. Transfer the Agentic ID = transfer the agent + all its reputation.
          </p>
        </div>

        {/* Listed for sale */}
        <h2 className="text-lg font-semibold text-t1 mb-4">For Sale</h2>
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-surface border border-line rounded-2xl animate-pulse" />)}
          </div>
        ) : listed.length === 0 ? (
          <div className="p-8 bg-surface border border-line rounded-2xl text-center mb-8">
            <p className="text-sm text-t3 mb-2">No agents listed for sale yet.</p>
            <p className="text-xs text-t3">Register an agent and list it to start trading.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {listed.map(a => (
              <motion.div key={String(a.id)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border border-line rounded-2xl p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #9200E1, #B75FFF)' }}>
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: '#05966915', color: '#059669' }}>
                    {formatEther(a.price)} OG
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-t1 mb-1">{a.name}</h3>
                <p className="text-[10px] text-t3 uppercase tracking-wider mb-1">{a.category} · ID #{String(a.id)}</p>
                <p className="text-xs text-t2 line-clamp-2 flex-1 mb-3">{a.description || 'AI agent on WorkAgnt 0G'}</p>
                <p className="text-[10px] text-t3 font-mono mb-3">Owner: {a.owner.slice(0, 6)}…{a.owner.slice(-4)}</p>
                {address?.toLowerCase() !== a.owner.toLowerCase() ? (
                  <button
                    onClick={() => handleBuy(a.id, a.price)}
                    disabled={!isConnected || isPending || isConfirming}
                    className="w-full py-2.5 text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-40"
                    style={{ background: 'linear-gradient(to right, #9200E1, #B75FFF)' }}
                  >
                    {isPending || isConfirming ? 'Processing…' : `Buy for ${formatEther(a.price)} OG`}
                  </button>
                ) : (
                  <button onClick={() => handleDelist(a.id)} disabled={isPending} className="w-full py-2 text-xs text-t2 bg-surface-2 border border-line rounded-lg hover:border-red hover:text-red">
                    Remove listing
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* My agents */}
        {isConnected && myAgents.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-t1 mb-4">Your Agents</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {myAgents.map(a => (
                <div key={String(a.id)} className="bg-surface border border-line rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #9200E1, #B75FFF)' }}>
                      {a.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-t1">{a.name}</h3>
                      <p className="text-[10px] text-t3">ID #{String(a.id)} · {a.category}</p>
                    </div>
                  </div>
                  {a.price > 0n ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green font-medium">Listed: {formatEther(a.price)} OG</span>
                      <button onClick={() => handleDelist(a.id)} disabled={isPending} className="text-xs text-red hover:underline">Delist</button>
                    </div>
                  ) : listingId === a.id ? (
                    <div className="flex gap-2">
                      <input value={listPrice} onChange={e => setListPrice(e.target.value)} type="number" min="0" step="0.001" placeholder="Price in OG" className="flex-1 px-2 py-1.5 bg-bg border border-line rounded-lg text-xs text-t1 outline-none focus:border-zg" />
                      <button onClick={() => handleList(a.id)} disabled={!listPrice || isPending} className="px-3 py-1.5 text-xs text-white rounded-lg disabled:opacity-40" style={{ background: '#9200E1' }}>List</button>
                      <button onClick={() => setListingId(null)} className="px-2 py-1.5 text-xs text-t3">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setListingId(a.id)} className="w-full py-2 text-xs font-medium text-zg bg-zg/5 border border-zg/20 rounded-lg hover:bg-zg/10">
                      List for sale →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {!isConnected && (
          <p className="text-xs text-t3 text-center mt-4">Connect wallet to see your agents and list them for sale.</p>
        )}
      </div>
    </div>
  )
}
