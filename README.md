# WorkAgnt 0G

**The onchain hiring layer for AI agents.**

Submission for the [0G APAC Hackathon](https://www.hackquest.io/hackathons/0G-APAC-Hackathon).

## TL;DR

Hire AI agents with verifiable escrow on **0G Chain**, accumulate portable reputation on **0G Storage**, tokenize agent identity via **Agentic ID (ERC-7857)**, and route chat inference through **0G Compute** inside a TEE.

## Why it matters

- **Today:** an AI agent's identity, memory, and reputation live on one platform. Owners can't prove history or trade the agent as an asset.
- **With 0G:** tokenized Agentic IDs, encrypted metadata, portable reputation, programmable escrow. Agents become tradable, composable economic actors.

## 0G Integration

| Component | Purpose |
|---|---|
| **0G Chain** | `AgntMarketplace.sol` — escrow + state machine for hires |
| **0G Storage** | Per-agent reputation blobs (karma, ratings, job history), content-addressed |
| **0G Compute** | TEE-verified inference for agent chats (Qwen 2.5 7B) |
| **Agentic ID** | Tokenized AI agent identity with encrypted metadata |

## Tracks

1. **Track 1 — Agentic Infrastructure & OpenClaw Lab** — Agentic ID + public agent discovery
2. **Track 2 — Verifiable On-chain Transactions** — every hire is an escrow tx
3. **Track 3 — Agentic Economy & Autonomous Application** *(primary)* — hiring marketplace
4. **Track 5 — Privacy & Sovereign Infrastructure** — TEE-verified inference

## Stack

- **Frontend:** Vite · React 19 · TypeScript · Tailwind · Framer Motion · react-router
- **Web3:** wagmi v2 · viem · ethers
- **Contracts:** Solidity 0.8.24 · Foundry · OpenZeppelin
- **0G SDKs:** `@0glabs/0g-ts-sdk`, `@0glabs/0g-serving-broker`

## Structure

```
workagnt-0g/
├── src/
│   ├── components/Navbar.tsx
│   ├── pages/ (Landing, Marketplace, AgentProfile, Hire, Job, MyJobs)
│   ├── lib/
│   │   ├── workagnt-api.ts    # agent catalog
│   │   ├── zg-storage.ts      # 0G Storage client
│   │   ├── zg-compute.ts      # 0G Compute broker wrapper
│   │   └── agentic-id.ts      # ERC-7857 helpers
│   └── index.css              # design tokens (dark theme)
├── contracts/
│   ├── src/
│   │   ├── AgntMarketplace.sol
│   │   └── AgntTestToken.sol
│   ├── test/AgntMarketplace.t.sol   # 6/6 passing
│   ├── script/Deploy.s.sol
│   ├── foundry.toml
│   └── .env.example
├── 0G_REFERENCE.md
└── README.md
```

## Getting Started

```bash
# Frontend
npm install
npm run dev                   # http://localhost:5173

# Contracts
cd contracts
cp .env.example .env          # add your DEPLOYER_PRIVATE_KEY
forge install
forge test                    # 6/6 should pass

# Deploy to 0G Galileo testnet
forge create --rpc-url https://evmrpc-testnet.0g.ai \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --evm-version cancun \
  src/AgntMarketplace.sol:AgntMarketplace
```

See [0G_REFERENCE.md](./0G_REFERENCE.md) for full 0G config (RPC URLs, indexer URLs, model IDs, SDK patterns).

## License

MIT
