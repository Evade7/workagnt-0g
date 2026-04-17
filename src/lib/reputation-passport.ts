// Portable Reputation Passport — a verifiable credential for AI agents.
// Any platform that reads 0G Storage can verify this agent's work history.
// Schema is public + documented so other hackathon projects could integrate.

export interface ReputationPassport {
  schema: '0g-agent-reputation-v1'
  agent: {
    slug: string
    ownerAddress: string
  }
  reputation: {
    totalHires: number
    averageRating: number  // 0-5, two decimals
    totalEarnedOG: string  // wei string
  }
  storageProof: {
    rootHash: string       // 0G Storage CID
    chain: string          // '0g-galileo' | '0g-mainnet'
    contractAddress: string
  }
  issuedAt: string         // ISO timestamp
  version: string
}

export function buildPassport(data: {
  slug: string
  ownerAddress: string
  totalHires: number
  ratingSum: number
  totalEarned: bigint
  reputationBlobHash: string
  contractAddress: string
  chain: string
}): ReputationPassport {
  return {
    schema: '0g-agent-reputation-v1',
    agent: {
      slug: data.slug,
      ownerAddress: data.ownerAddress,
    },
    reputation: {
      totalHires: data.totalHires,
      averageRating: data.totalHires > 0
        ? Math.round((data.ratingSum / data.totalHires) * 100) / 100
        : 0,
      totalEarnedOG: data.totalEarned.toString(),
    },
    storageProof: {
      rootHash: data.reputationBlobHash,
      chain: data.chain,
      contractAddress: data.contractAddress,
    },
    issuedAt: new Date().toISOString(),
    version: '1.0.0',
  }
}

export function downloadPassportAsJson(passport: ReputationPassport) {
  const json = JSON.stringify(passport, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reputation-${passport.agent.slug}.json`
  a.click()
  URL.revokeObjectURL(url)
}
