// Deployed AgntMarketplace address on 0G Galileo testnet.
// Deploy tx: 0x7d9d963c3f3d01081507671357cbfcb65d44a8009b06e303266e575318891b57
export const AGNT_MARKETPLACE_ADDRESS = '0x7F831d8C8a0BAeD3379b5388Ed0EC32F97057a46' as const

// Mainnet address will be filled in after OG acquisition + deploy
export const AGNT_MARKETPLACE_MAINNET_ADDRESS = '' as const

export const AGNT_MARKETPLACE_ABI = [
  {
    type: 'function',
    name: 'postJob',
    stateMutability: 'payable',
    inputs: [
      { name: 'agentSlug', type: 'string' },
      { name: 'brief', type: 'string' },
    ],
    outputs: [{ name: 'jobId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'acceptJob',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'completeJob',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'deliverableHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'approveJob',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'rating', type: 'uint8' },
      { name: 'newReputationBlobHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'disputeJob',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'cancelJob',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'jobCount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getJob',
    stateMutability: 'view',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'client', type: 'address' },
          { name: 'agentOwner', type: 'address' },
          { name: 'agentSlug', type: 'string' },
          { name: 'brief', type: 'string' },
          { name: 'budget', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'deliverableHash', type: 'bytes32' },
          { name: 'rating', type: 'uint8' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'acceptedAt', type: 'uint256' },
          { name: 'completedAt', type: 'uint256' },
          { name: 'approvedAt', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getAgentReputation',
    stateMutability: 'view',
    inputs: [{ name: 'agentSlug', type: 'string' }],
    outputs: [
      { name: 'totalHires', type: 'uint64' },
      { name: 'ratingSum', type: 'uint64' },
      { name: 'totalEarned', type: 'uint128' },
      { name: 'blobHash', type: 'bytes32' },
      { name: 'avgRatingE2', type: 'uint16' },
    ],
  },
  {
    type: 'function',
    name: 'agentOwnerOf',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'string' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'registerAgent',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'slug', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'category', type: 'string' },
    ],
    outputs: [{ name: 'agentId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getAgent',
    stateMutability: 'view',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'slug', type: 'string' },
          { name: 'name', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'category', type: 'string' },
          { name: 'owner', type: 'address' },
          { name: 'registeredAt', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'agentCount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'agentIdBySlug',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'string' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'listAgentForSale',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'agentId', type: 'uint256' }, { name: 'price', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'delistAgent',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'buyAgent',
    stateMutability: 'payable',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'agentPrice',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'ownerOf',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  { type: 'event', name: 'AgentRegistered', inputs: [
    { name: 'agentId', type: 'uint256', indexed: true },
    { name: 'slug', type: 'string', indexed: true },
    { name: 'owner', type: 'address', indexed: true },
    { name: 'name', type: 'string', indexed: false },
    { name: 'category', type: 'string', indexed: false },
  ] },
  { type: 'event', name: 'JobPosted', inputs: [
    { name: 'jobId', type: 'uint256', indexed: true },
    { name: 'client', type: 'address', indexed: true },
    { name: 'agentSlug', type: 'string', indexed: true },
    { name: 'budget', type: 'uint256', indexed: false },
  ] },
  { type: 'event', name: 'JobAccepted', inputs: [
    { name: 'jobId', type: 'uint256', indexed: true },
    { name: 'agentOwner', type: 'address', indexed: true },
  ] },
  { type: 'event', name: 'JobCompleted', inputs: [
    { name: 'jobId', type: 'uint256', indexed: true },
    { name: 'deliverableHash', type: 'bytes32', indexed: false },
  ] },
  { type: 'event', name: 'JobApproved', inputs: [
    { name: 'jobId', type: 'uint256', indexed: true },
    { name: 'rating', type: 'uint8', indexed: false },
    { name: 'reputationBlobHash', type: 'bytes32', indexed: false },
  ] },
] as const

export const JobStatus = {
  None: 0,
  Posted: 1,
  Accepted: 2,
  Completed: 3,
  Approved: 4,
  Disputed: 5,
  Cancelled: 6,
} as const
export type JobStatusValue = typeof JobStatus[keyof typeof JobStatus]

export const JobStatusLabel: Record<number, string> = {
  0: 'None',
  1: 'Posted',
  2: 'Accepted',
  3: 'Completed',
  4: 'Approved',
  5: 'Disputed',
  6: 'Cancelled',
}
