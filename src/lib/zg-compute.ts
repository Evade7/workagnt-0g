// 0G Compute broker — verifiable AI inference via the 0G decentralized GPU network.
// Uses @0glabs/0g-serving-broker. Inference runs in TEE for privacy (Track 5 relevance).
//
// Docs: https://docs.0g.ai/build-with-0g/compute

import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker'

export interface ComputeResponse {
  reply: string
  provider: string       // 0G Compute node that served the request
  verified: boolean      // TEE attestation verified
  model: string
}

// Lazy-init — broker is instantiated on first call with the user's signer
let brokerPromise: Promise<any> | null = null

async function getBroker(signer: any) {
  if (!brokerPromise) {
    brokerPromise = createZGComputeNetworkBroker(signer)
  }
  return brokerPromise
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

/**
 * Send a prompt to a 0G Compute provider and verify the response was produced
 * inside a TEE. Returns a stub response when the broker is unavailable so the UI
 * stays functional during local dev.
 */
export async function inferenceWith0G(
  prompt: string,
  opts?: { signer?: any; providerAddress?: string; model?: string }
): Promise<ComputeResponse> {
  if (!opts?.signer) {
    return {
      reply: '[0G Compute unavailable — connect wallet to use verifiable inference]',
      provider: 'fallback',
      verified: false,
      model: opts?.model || 'stub',
    }
  }

  try {
    const broker = await getBroker(opts.signer)
    const providers = await broker.inference.listService()
    const target = opts.providerAddress
      ? providers.find((p: any) => p.provider === opts.providerAddress)
      : providers[0]
    if (!target) throw new Error('No 0G Compute providers available')

    const { endpoint, model } = await broker.inference.getServiceMetadata(target.provider)
    const headers = await broker.inference.getRequestHeaders(target.provider, prompt)

    const res = await fetch(`${endpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: opts.model || model,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await res.json()
    const reply = data?.choices?.[0]?.message?.content || ''

    const verified = await broker.inference.processResponse(
      target.provider,
      reply,
      data?.id
    ).catch(() => false)

    return {
      reply,
      provider: target.provider,
      verified: Boolean(verified),
      model: opts.model || model,
    }
  } catch (err: any) {
    console.warn('[0G Compute] inference failed', err)
    return {
      reply: `[0G Compute error: ${err?.message || 'request failed'}]`,
      provider: 'error',
      verified: false,
      model: opts?.model || 'stub',
    }
  }
}
