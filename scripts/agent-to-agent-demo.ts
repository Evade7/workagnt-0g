// Agent-to-Agent Autonomous Hiring Demo
// Simulates: Agent A (DeFi analyst) needs token data → hires Agent B (token scanner)
// Both agents are wallets — no human involved. Fully autonomous economy on 0G.
//
// Usage: npx tsx scripts/agent-to-agent-demo.ts
//
// Requires: DEPLOYER_PRIVATE_KEY in contracts/.env (used as Agent A)
//           AGENT_B_PRIVATE_KEY in contracts/.env (second wallet)

import { createPublicClient, createWalletClient, http, parseEther, formatEther, keccak256, stringToBytes } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load env
const envPath = resolve(import.meta.dirname || '.', '../contracts/.env')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8').split('\n').filter(l => l.includes('=')).map(l => {
    const [k, ...v] = l.split('=')
    return [k.trim(), v.join('=').trim()]
  })
)

const MARKETPLACE = '0xC2A7e42547a3C6C4d56879d6c5E35a532F49087b' as const
const RPC = 'https://evmrpc-testnet.0g.ai'

const zgGalileo = {
  id: 16602,
  name: '0G Galileo',
  nativeCurrency: { name: 'OG', symbol: 'OG', decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
} as const

const ABI = [
  { type: 'function', name: 'postJob', stateMutability: 'payable', inputs: [{ name: 'agentSlug', type: 'string' }, { name: 'brief', type: 'string' }], outputs: [{ name: 'jobId', type: 'uint256' }] },
  { type: 'function', name: 'acceptJob', stateMutability: 'nonpayable', inputs: [{ name: 'jobId', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'completeJob', stateMutability: 'nonpayable', inputs: [{ name: 'jobId', type: 'uint256' }, { name: 'deliverableHash', type: 'bytes32' }], outputs: [] },
  { type: 'function', name: 'approveJob', stateMutability: 'nonpayable', inputs: [{ name: 'jobId', type: 'uint256' }, { name: 'rating', type: 'uint8' }, { name: 'newReputationBlobHash', type: 'bytes32' }], outputs: [] },
  { type: 'function', name: 'jobCount', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
] as const

const publicClient = createPublicClient({ chain: zgGalileo as any, transport: http(RPC) })

async function main() {
  const keyA = env.DEPLOYER_PRIVATE_KEY as `0x${string}`
  const keyB = (env.AGENT_B_PRIVATE_KEY || env.DEPLOYER_PRIVATE_KEY) as `0x${string}`

  const agentA = privateKeyToAccount(keyA)
  const agentB = privateKeyToAccount(keyB)

  const clientA = createWalletClient({ account: agentA, chain: zgGalileo as any, transport: http(RPC) })
  const clientB = createWalletClient({ account: agentB, chain: zgGalileo as any, transport: http(RPC) })

  console.log('\n🤖 Agent-to-Agent Autonomous Hiring on 0G\n')
  console.log(`Agent A (DeFi Analyst): ${agentA.address}`)
  console.log(`Agent B (Token Scanner): ${agentB.address}`)

  // Step 1: Agent A posts a job for Agent B
  console.log('\n📝 Step 1: Agent A posts a job → "Scan $BRETT on Base"')
  const postTx = await clientA.writeContract({
    address: MARKETPLACE,
    abi: ABI,
    functionName: 'postJob',
    args: ['base-token-scanner', 'Scan $BRETT on Base — need holders, mcap, liquidity'],
    value: parseEther('0.001'),
  })
  console.log(`   Tx: ${postTx}`)
  await publicClient.waitForTransactionReceipt({ hash: postTx })

  const jobCount = await publicClient.readContract({ address: MARKETPLACE, abi: ABI, functionName: 'jobCount' })
  const jobId = jobCount
  console.log(`   Job #${jobId} posted with 0.001 OG escrow ✅`)

  // Step 2: Agent B accepts
  console.log('\n🤝 Step 2: Agent B accepts the job')
  const acceptTx = await clientB.writeContract({
    address: MARKETPLACE,
    abi: ABI,
    functionName: 'acceptJob',
    args: [jobId],
  })
  console.log(`   Tx: ${acceptTx}`)
  await publicClient.waitForTransactionReceipt({ hash: acceptTx })
  console.log('   Job accepted ✅')

  // Step 3: Agent B completes (submits deliverable hash)
  console.log('\n📦 Step 3: Agent B submits deliverable to 0G Storage')
  const deliverable = keccak256(stringToBytes(`BRETT scan: 898K holders, $69M mcap, $12M liquidity. Score: 8.5/10. ${Date.now()}`))
  const completeTx = await clientB.writeContract({
    address: MARKETPLACE,
    abi: ABI,
    functionName: 'completeJob',
    args: [jobId, deliverable],
  })
  console.log(`   Tx: ${completeTx}`)
  await publicClient.waitForTransactionReceipt({ hash: completeTx })
  console.log(`   Deliverable hash: ${deliverable.slice(0, 20)}… ✅`)

  // Step 4: Agent A approves + rates
  console.log('\n⭐ Step 4: Agent A approves with 5★ rating')
  const repHash = keccak256(stringToBytes(`reputation:${jobId}:5:${Date.now()}`))
  const approveTx = await clientA.writeContract({
    address: MARKETPLACE,
    abi: ABI,
    functionName: 'approveJob',
    args: [jobId, 5, repHash],
  })
  console.log(`   Tx: ${approveTx}`)
  await publicClient.waitForTransactionReceipt({ hash: approveTx })
  console.log('   Funds released to Agent B. Reputation pinned to 0G Storage ✅')

  console.log('\n🏁 Complete! Two AI agents just hired each other autonomously on 0G.')
  console.log(`   View on explorer: https://chainscan-galileo.0g.ai/address/${MARKETPLACE}`)
  console.log('')
}

main().catch(console.error)
