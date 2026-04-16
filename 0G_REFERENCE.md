# 0G Technical Reference — WorkAgnt Hackathon

Quick-reference for all 0G components, config values, SDKs, and integration decisions.
Compiled from official docs at docs.0g.ai + starter kit repos.

## 0G Chain (Galileo Testnet)

| Field | Value |
|---|---|
| RPC | `https://evmrpc-testnet.0g.ai` |
| Chain ID | `16602` |
| Symbol | `OG` |
| Explorer | `https://chainscan-galileo.0g.ai` |
| Faucet | `https://hub.0g.ai/faucet?network=testnet` |
| EVM version | `cancun` (required for Foundry deploys) |

**Deploy command (per official docs):**

```bash
forge create --rpc-url https://evmrpc-testnet.0g.ai \
  --private-key $PRIVATE_KEY \
  --evm-version cancun \
  src/AgntMarketplace.sol:AgntMarketplace
```

**foundry.toml required settings:**

```toml
[profile.default]
evm_version = "cancun"
via_ir = true
solc_version = "0.8.24"
```

**MetaMask config:**

- Network Name: 0G Galileo Testnet
- RPC URL: `https://evmrpc-testnet.0g.ai`
- Chain ID: `16602`
- Currency: `OG`
- Explorer: `https://chainscan-galileo.0g.ai`

## 0G Storage

**SDK:** `@0gfoundation/0g-ts-sdk` v1.2.1 (use this, NOT `@0glabs/0g-ts-sdk`)

```bash
npm install @0gfoundation/0g-ts-sdk ethers
```

**Node requirement:** >= 18 (we have 20.18 — compatible)

**Indexer URLs:**

| Mode | Testnet | Mainnet |
|---|---|---|
| Turbo (faster, higher fees) | `https://indexer-storage-testnet-turbo.0g.ai` | `https://indexer-storage-turbo.0g.ai` |
| Standard (slower, lower fees) | `https://indexer-storage-testnet-standard.0g.ai` | `https://indexer-storage.0g.ai` |

**Flow contract:** auto-discovered from indexer URL — do NOT pass manually.

**Upload flow:**

```typescript
import { ZgFile, Indexer } from '@0gfoundation/0g-ts-sdk'
import { ethers } from 'ethers'

const provider = new ethers.JsonRpcProvider('https://evmrpc-testnet.0g.ai')
const signer = new ethers.Wallet(PRIVATE_KEY, provider)
const indexer = new Indexer('https://indexer-storage-testnet-turbo.0g.ai')

// Upload file
const file = await ZgFile.fromFilePath('./reputation.json')
const [tx, err] = await indexer.upload(file, 'https://evmrpc-testnet.0g.ai', signer)
// tx contains rootHash (66-char hex, 0x-prefixed)
```

**Download flow (no key needed):**

```typescript
const indexer = new Indexer('https://indexer-storage-testnet-turbo.0g.ai')
const data = await indexer.download(rootHash, outputPath, withProof)
```

**Key facts:**

- rootHash = Merkle root, 66-char hex string — this is the CID
- Upload needs signer + OG tokens for fees
- Download is free (only needs rootHash)
- Browser downloads require reimplementation via StorageNode methods

## 0G Compute

**SDK:** `@0glabs/0g-serving-broker`

```bash
pnpm add @0glabs/0g-serving-broker -g
```

**Node requirement:** >= 22.0 (need to upgrade from 20.18)

**Hosted Web UI:** `https://compute-marketplace.0g.ai/inference`

**Testnet models (as of April 2026):**

| Model | Type | Provider | Input Price | Output Price |
|---|---|---|---|---|
| Qwen 2.5 7B Instruct | Chatbot | 0xa48f01... | 0.05 OG / 1M tokens | 0.10 OG / 1M tokens |
| Qwen Image Edit 2511 | Image-Edit | 0x4b2a9... | — | 0.005 OG / image |

**Wallet requirements for direct SDK usage:**

- 3 OG minimum to create a ledger
- 1 OG minimum per provider to fund

**SDK inference flow:**

```typescript
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker'

const broker = await createZGComputeNetworkBroker(signer)

// 1. Create ledger (3 OG min)
await broker.ledger.addLedger(ethers.parseEther('3'))

// 2. Acknowledge provider
await broker.inference.acknowledgeProviderSigner(PROVIDER_ADDRESS)

// 3. Fund provider (1 OG min)
await broker.ledger.transferFund(PROVIDER_ADDRESS, 'inference', ethers.parseEther('1'))

// 4. Get metadata + headers
const { endpoint, model } = await broker.inference.getServiceMetadata(PROVIDER_ADDRESS)
const headers = await broker.inference.getRequestHeaders(PROVIDER_ADDRESS, prompt)

// 5. Call (OpenAI-compatible)
const res = await fetch(`${endpoint}/v1/chat/completions`, {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
})

// 6. Verify TEE response
const verified = await broker.inference.processResponse(PROVIDER_ADDRESS, reply, data.id)
```

**Starter kit:** `github.com/0gfoundation/0g-compute-ts-starter-kit`

## 0G DA (Data Availability)

**Verdict: too heavy for hackathon scope.** Roadmap item.

- Requires running DA Client + Encoder + Retriever nodes
- Encoder needs NVIDIA RTX 4090 GPU with CUDA 12.04
- Docker-based infra, 8GB RAM per node
- Max blob: 32.5 MB
- Entrance contract: `0x857C0A28A8634614BB2C96039Cf4a20AFF709Aa9`

## Agentic ID (ERC-7857)

**Standard:** ERC-7857 — AI Agent NFTs with encrypted data and verifiable metadata.

**What it does:**

- Tokenizes intelligence, memory, behavior of AI agents
- Supports encrypted metadata (agent memory, knowledge base)
- Interactive evolution (agent improves, token reflects it)
- Tradable ownership (sell your AI employee as an NFT)
- Composability (agents use each other's capabilities)

**Our integration:**

- Each WorkAgnt AI employee gets an Agentic ID token
- Metadata stored on 0G Storage (encrypted memory CID, reputation CID, capabilities)
- Token ownership = agent ownership (transfer token = transfer agent)
- `src/lib/agentic-id.ts` has metadata builder + tokenId derivation helpers

## Quick Links

| Resource | URL |
|---|---|
| 0G Docs | `https://docs.0g.ai` |
| Testnet Explorer | `https://chainscan-galileo.0g.ai` |
| Storage Explorer | `https://storagescan-galileo.0g.ai` |
| Faucet | `https://hub.0g.ai/faucet?network=testnet` |
| Compute Marketplace | `https://compute-marketplace.0g.ai/inference` |
| HackQuest Hackathon | `https://www.hackquest.io/hackathons/0G-APAC-Hackathon` |
| awesome-0g | `https://github.com/0gfoundation/awesome-0g` |
| 0G TS SDK | `https://github.com/0gfoundation/0g-ts-sdk` |
| Storage Starter Kit | `https://github.com/0gfoundation/0g-storage-ts-starter-kit` |
| Compute Starter Kit | `https://github.com/0gfoundation/0g-compute-ts-starter-kit` |
| Storage Web Kit | `https://github.com/0glabs/0g-storage-web-starter-kit` |
| 0G Discord | `https://discord.gg/0glabs` |
| 0G APAC Dev TG | `https://t.me/zerog_apac_dev` |

## Our Integration Plan

| 0G Component | Our Use | Status |
|---|---|---|
| **0G Chain** | AgntMarketplace.sol escrow + reputation | Written + tested, deploy pending |
| **0G Storage** | Reputation JSON blobs per agent | Lib written, integration pending |
| **0G Compute** | TEE-verified inference for hired agents | Lib written, needs Node 22 + more OG |
| **Agentic ID** | Tokenized agent identity per listing | Lib written, helpers ready |
| **0G DA** | Chat transcript availability (stretch) | Skip — too heavy |

## Tracks We're Claiming

1. **Track 1 — Agentic Infrastructure & OpenClaw Lab** — our public API + Agent ID
2. **Track 2 — Verifiable On-chain Transactions** — every hire is an escrow tx
3. **Track 3 — Agentic Economy & Autonomous Application** (primary) — hiring marketplace
4. **Track 5 — Privacy & Sovereign Infrastructure** — 0G Compute TEE
