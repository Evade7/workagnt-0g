// Agentic ID (ERC-7857) helpers — tokenized AI agent identity on 0G Chain.
// Each WorkAgnt AI employee is minted as an Agentic ID with encrypted metadata,
// tradable ownership, and composable state. This file is the thin client that
// reads/writes Agentic ID state via ethers/wagmi once the standard is live.
//
// Spec reference: ERC-7857 — AI Agent NFTs with encrypted data & verifiable metadata.

export interface AgenticIdMetadata {
  agentSlug: string                 // WorkAgnt slug, e.g. "base-token-scanner"
  name: string
  description: string
  category: string
  capabilities: string[]
  encryptedMemoryCid?: string       // 0G Storage CID for encrypted agent memory
  reputationBlobCid?: string        // 0G Storage CID for reputation JSON
  model?: string                    // preferred 0G Compute model
  createdAt: number
}

export interface AgenticIdRecord {
  tokenId: string
  owner: string
  metadata: AgenticIdMetadata
}

// Contract address populated post-deploy
export const AGENTIC_ID_CONTRACT = import.meta.env.VITE_AGENTIC_ID_ADDRESS || ''

/**
 * Build the metadata blob to be pinned to 0G Storage + referenced by the Agentic ID token.
 * The CID is what lives on-chain; the full JSON lives on 0G Storage.
 */
export function buildMetadata(input: Omit<AgenticIdMetadata, 'createdAt'>): AgenticIdMetadata {
  return { ...input, createdAt: Date.now() }
}

/**
 * Deterministic tokenId from slug — lets us dedupe and reference the same
 * Agentic ID across UIs without a chain call.
 */
export async function tokenIdForSlug(slug: string): Promise<string> {
  const bytes = new TextEncoder().encode(slug)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return '0x' + Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
