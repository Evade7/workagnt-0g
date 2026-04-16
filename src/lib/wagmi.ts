import { defineChain } from 'viem'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const zgGalileo = defineChain({
  id: 16602,
  name: '0G Galileo Testnet',
  nativeCurrency: { name: 'OG', symbol: 'OG', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: { name: 'ChainScan Galileo', url: 'https://chainscan-galileo.0g.ai' },
  },
  testnet: true,
})

export const zgMainnet = defineChain({
  id: 16661,
  name: '0G Mainnet',
  nativeCurrency: { name: 'OG', symbol: 'OG', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc.0g.ai'] },
  },
  blockExplorers: {
    default: { name: 'ChainScan', url: 'https://chainscan.0g.ai' },
  },
})

export const wagmiConfig = getDefaultConfig({
  appName: 'WorkAgnt 0G',
  projectId: import.meta.env.VITE_WC_PROJECT_ID || '00000000000000000000000000000000',
  chains: [zgGalileo, zgMainnet],
  ssr: false,
})
