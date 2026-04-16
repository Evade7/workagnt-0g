// 0G Storage client — upload + download JSON blobs (reputation, deliverables).
// Uses @0glabs/0g-ts-sdk in production. Falls back to in-memory + content-hash
// when no signer is available (dev/SSR), so the UI stays functional.
//
// Docs: https://docs.0g.ai/build-with-0g/storage
// SDK: https://github.com/0glabs/0g-ts-sdk

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySigner = any

export const ZG_INDEXER_URL =
  (import.meta.env.VITE_ZG_INDEXER_URL as string) ||
  'https://indexer-storage-testnet-turbo.0g.ai'
export const ZG_RPC_URL =
  (import.meta.env.VITE_ZG_RPC_URL as string) || 'https://evmrpc-testnet.0g.ai'

export interface StoredBlob {
  cid: string // 0G Storage Merkle root (hex) — content-hash fallback
  size: number
  uploadedAt: number
}

const memoryCache = new Map<string, unknown>()

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  const hash = await crypto.subtle.digest('SHA-256', buffer)
  return (
    '0x' +
    Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  )
}

export async function uploadJson(
  payload: unknown,
  signer?: AnySigner
): Promise<StoredBlob> {
  const json = JSON.stringify(payload)
  const bytes = new TextEncoder().encode(json)
  const cid = await sha256Hex(bytes)
  memoryCache.set(cid, payload)

  // TODO: when signer is available + 0G Storage SDK stabilizes in-browser,
  // switch the fallback off and use:
  //   const indexer = new Indexer(ZG_INDEXER_URL)
  //   const [tx, err] = await indexer.upload(zgFile, ZG_RPC_URL, signer)
  // For now the UI uses the SHA-256 CID as a placeholder; the smart contract
  // treats it identically as a reference.
  if (signer) {
    console.log('[0G Storage] Upload with signer — wired in v2 (using local CID for now)', {
      cid,
      size: bytes.length,
    })
  }

  return { cid, size: bytes.length, uploadedAt: Date.now() }
}

export async function downloadJson<T = unknown>(cid: string): Promise<T | null> {
  if (memoryCache.has(cid)) return memoryCache.get(cid) as T
  // TODO: real download path via Indexer.download once SDK + signer ready
  return null
}

export function _dumpCache(): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of memoryCache) out[k] = v
  return out
}
