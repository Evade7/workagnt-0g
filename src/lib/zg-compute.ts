// 0G Compute broker — verifiable AI inference via the 0G decentralized GPU network.
// Uses @0glabs/0g-serving-broker. Inference runs in TEE for privacy.
//
// Flow: deposit OG → acknowledge provider → get headers → query → verify TEE response
// Docs: https://docs.0g.ai/build-with-0g/compute

import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker'

export interface ComputeResponse {
  reply: string
  provider: string
  verified: boolean
  model: string
  error?: string
}

let brokerInstance: any = null
let brokerSigner: any = null

async function getBroker(signer: any) {
  if (brokerInstance && brokerSigner === signer) return brokerInstance
  brokerInstance = await createZGComputeNetworkBroker(signer)
  brokerSigner = signer
  return brokerInstance
}

export async function setupComputeAccount(signer: any, depositAmount = '3'): Promise<string> {
  try {
    const broker = await getBroker(signer)
    const { ethers } = await import('ethers')
    await broker.ledger.depositFund(ethers.parseEther(depositAmount))
    return 'Deposited ' + depositAmount + ' OG to Compute ledger'
  } catch (err: any) {
    return 'Setup failed: ' + (err?.message || 'unknown error')
  }
}

export async function listProviders(signer: any): Promise<any[]> {
  try {
    const broker = await getBroker(signer)
    return await broker.inference.listService()
  } catch (err) {
    console.warn('[0G Compute] listProviders failed', err)
    return []
  }
}

export async function inferenceWith0G(
  prompt: string,
  opts?: { signer?: any; providerAddress?: string; model?: string }
): Promise<ComputeResponse> {
  if (!opts?.signer) {
    return {
      reply: 'Connect wallet and fund your 0G Compute account to use TEE-verified chat.',
      provider: 'none',
      verified: false,
      model: 'none',
      error: 'no_signer',
    }
  }

  try {
    const broker = await getBroker(opts.signer)

    // List available providers
    const providers = await broker.inference.listService()
    if (!providers || providers.length === 0) {
      return {
        reply: 'No 0G Compute providers currently available on testnet. Try again later.',
        provider: 'none',
        verified: false,
        model: 'none',
        error: 'no_providers',
      }
    }

    const target = opts.providerAddress
      ? providers.find((p: any) => p.provider === opts.providerAddress)
      : providers[0]
    if (!target) throw new Error('Provider not found')

    // Acknowledge provider if needed (first-time per provider)
    try {
      await broker.inference.acknowledgeProviderSigner(target.provider)
    } catch {
      // May already be acknowledged — ignore
    }

    const { endpoint, model } = await broker.inference.getServiceMetadata(target.provider)
    const headers = await broker.inference.getRequestHeaders(target.provider, prompt)

    const res = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: opts.model || model,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      throw new Error(`Compute API ${res.status}: ${errBody.slice(0, 200)}`)
    }

    const data = await res.json()
    const reply = data?.choices?.[0]?.message?.content || '[empty response]'

    let verified = false
    try {
      verified = Boolean(await broker.inference.processResponse(target.provider, reply, data?.id))
    } catch {
      // Verification failed but we still have the reply
    }

    return {
      reply,
      provider: target.provider,
      verified,
      model: opts.model || model,
    }
  } catch (err: any) {
    const msg = err?.message || 'request failed'
    console.warn('[0G Compute] inference failed:', msg)

    // Provide helpful error messages
    if (msg.includes('insufficient') || msg.includes('balance') || msg.includes('fund')) {
      return {
        reply: 'Insufficient 0G Compute balance. Deposit OG to your Compute ledger first (minimum 3 OG).',
        provider: 'error',
        verified: false,
        model: 'none',
        error: 'insufficient_balance',
      }
    }

    return {
      reply: `0G Compute error: ${msg.slice(0, 150)}`,
      provider: 'error',
      verified: false,
      model: 'none',
      error: msg,
    }
  }
}
