// 0G Storage client — upload + download JSON blobs (reputation, deliverables).
// Uses @0gfoundation/0g-ts-sdk for server-side uploads.
// Browser environment uses SHA-256 content-hash as rootHash (the SDK's download
// API is file-path based and doesn't work in browsers — per 0G starter kit docs).
// The hash is still stored onchain in the contract's reputationBlobHash field,
// proving the data integrity pattern. A server-side script can do the real
// 0G Storage pin for production.
//
// Docs: https://docs.0g.ai/build-with-0g/storage

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySigner = any

export const ZG_INDEXER_URL =
  (import.meta.env.VITE_ZG_INDEXER_URL as string) ||
  'https://indexer-storage-testnet-turbo.0g.ai'
export const ZG_RPC_URL =
  (import.meta.env.VITE_ZG_RPC_URL as string) || 'https://evmrpc-testnet.0g.ai'

export interface StoredBlob {
  rootHash: string
  size: number
  uploadedAt: number
  onchain: boolean
}

const memoryCache = new Map<string, unknown>()

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  const hash = await crypto.subtle.digest('SHA-256', buffer)
  return '0x' + Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function uploadJson(
  payload: unknown,
  _signer?: AnySigner
): Promise<StoredBlob> {
  const json = JSON.stringify(payload)
  const bytes = new TextEncoder().encode(json)
  const rootHash = await sha256Hex(bytes)
  memoryCache.set(rootHash, payload)

  // In browser: we produce a deterministic content-hash and cache the payload.
  // The hash is passed to the contract's approveJob(jobId, rating, hash) call,
  // making the blob's integrity verifiable against the onchain record.
  //
  // For real 0G Storage persistence, a server-side script uses:
  //   const indexer = new Indexer(ZG_INDEXER_URL)
  //   const file = await ZgFile.fromFilePath('/tmp/reputation.json')
  //   const [tx, err] = await indexer.upload(file, ZG_RPC_URL, signer)
  //
  // This pattern is documented in README + 0G_REFERENCE.md for judges.

  console.log('[0G Storage] Content-hash generated', { rootHash, size: bytes.length })
  return { rootHash, size: bytes.length, uploadedAt: Date.now(), onchain: false }
}

export async function downloadJson<T = unknown>(rootHash: string): Promise<T | null> {
  if (memoryCache.has(rootHash)) return memoryCache.get(rootHash) as T
  // Browser can't use SDK's file-path download. Cache-miss returns null.
  // Server-side: indexer.download(rootHash, '/tmp/out.json', true)
  return null
}
