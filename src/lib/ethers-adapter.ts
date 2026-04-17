// Wagmi v2 → ethers v6 signer adapter
// 0G Storage SDK requires an ethers Signer, but wagmi uses viem.
// This hook creates an ethers Signer from the connected wagmi wallet.

import { useMemo } from 'react'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { useConnectorClient } from 'wagmi'

function clientToSigner(client: any): JsonRpcSigner | undefined {
  if (!client) return undefined
  const { account, chain, transport } = client
  const network = { chainId: chain.id, name: chain.name, ensAddress: chain.contracts?.ensRegistry?.address }
  const provider = new BrowserProvider(transport, network)
  return new JsonRpcSigner(provider, account.address)
}

export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient({ chainId })
  return useMemo(() => clientToSigner(client), [client])
}
