// Read onchain events from AgntMarketplace for the live activity feed.
// Uses viem's getLogs to fetch indexed events from the contract.

import { createPublicClient, http, parseAbiItem, formatEther } from 'viem'
import { zgGalileo } from './wagmi'
import { AGNT_MARKETPLACE_ADDRESS } from './contracts'

const client = createPublicClient({
  chain: zgGalileo,
  transport: http(),
})

export interface FeedEvent {
  kind: 'posted' | 'accepted' | 'completed' | 'approved' | 'disputed' | 'cancelled'
  jobId: string
  agent: string
  detail: string
  badge: string
  txHash: string
  blockNumber: bigint
}

const eventAbis = {
  posted: parseAbiItem('event JobPosted(uint256 indexed jobId, address indexed client, string indexed agentSlug, uint256 budget)'),
  accepted: parseAbiItem('event JobAccepted(uint256 indexed jobId, address indexed agentOwner)'),
  completed: parseAbiItem('event JobCompleted(uint256 indexed jobId, bytes32 deliverableHash)'),
  approved: parseAbiItem('event JobApproved(uint256 indexed jobId, uint8 rating, bytes32 reputationBlobHash)'),
  disputed: parseAbiItem('event JobDisputed(uint256 indexed jobId, address indexed by)'),
  cancelled: parseAbiItem('event JobCancelled(uint256 indexed jobId)'),
}

export async function fetchRecentEvents(fromBlock?: bigint): Promise<FeedEvent[]> {
  const events: FeedEvent[] = []
  const block = fromBlock ?? 0n

  try {
    const [posted, accepted, completed, approved] = await Promise.all([
      client.getLogs({ address: AGNT_MARKETPLACE_ADDRESS, event: eventAbis.posted, fromBlock: block }).catch(() => []),
      client.getLogs({ address: AGNT_MARKETPLACE_ADDRESS, event: eventAbis.accepted, fromBlock: block }).catch(() => []),
      client.getLogs({ address: AGNT_MARKETPLACE_ADDRESS, event: eventAbis.completed, fromBlock: block }).catch(() => []),
      client.getLogs({ address: AGNT_MARKETPLACE_ADDRESS, event: eventAbis.approved, fromBlock: block }).catch(() => []),
    ])

    for (const log of posted) {
      const args = log.args as any
      events.push({
        kind: 'posted',
        jobId: String(args.jobId ?? ''),
        agent: args.agentSlug ?? '',
        detail: `Job posted · ${args.budget ? formatEther(args.budget) + ' OG escrow' : ''}`,
        badge: '0G Chain',
        txHash: log.transactionHash ?? '',
        blockNumber: log.blockNumber ?? 0n,
      })
    }

    for (const log of accepted) {
      const args = log.args as any
      events.push({
        kind: 'accepted',
        jobId: String(args.jobId ?? ''),
        agent: '',
        detail: `Job #${args.jobId} accepted by agent owner`,
        badge: '0G Chain',
        txHash: log.transactionHash ?? '',
        blockNumber: log.blockNumber ?? 0n,
      })
    }

    for (const log of completed) {
      const args = log.args as any
      events.push({
        kind: 'completed',
        jobId: String(args.jobId ?? ''),
        agent: '',
        detail: `Deliverable submitted · CID: ${args.deliverableHash?.slice(0, 12)}…`,
        badge: '0G Storage',
        txHash: log.transactionHash ?? '',
        blockNumber: log.blockNumber ?? 0n,
      })
    }

    for (const log of approved) {
      const args = log.args as any
      events.push({
        kind: 'approved',
        jobId: String(args.jobId ?? ''),
        agent: '',
        detail: `Approved · ${args.rating}/5 ★ · reputation pinned`,
        badge: '0G Storage',
        txHash: log.transactionHash ?? '',
        blockNumber: log.blockNumber ?? 0n,
      })
    }
  } catch (err) {
    console.warn('[Events] Failed to fetch logs', err)
  }

  return events.sort((a, b) => Number(b.blockNumber - a.blockNumber))
}
