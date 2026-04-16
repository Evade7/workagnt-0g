# WorkAgnt 0G — Build Progress

**Resume file.** Read this first when returning to the project.

## Status Legend

- [ ] not started · [~] in progress · [x] done · [!] blocked

## Hackathon Facts

- **Event:** 0G APAC Hackathon 2026
- **Deadline:** May 16, 2026 · 23:59 UTC+8
- **Primary track:** Track 3 — Agentic Economy & Autonomous Applications
- **Cross-tracks:** Track 1 (Agentic Infrastructure) · Track 5 (Privacy & Sovereign Infra)
- **Mainnet contract required** for final submission (per 0G integration proof rules)
- **Public X post required** with tags `@0G_labs @0g_CN @0g_Eco @HackQuest_` and hashtags `#0GHackathon #BuildOn0G`

## Key Artifacts

- **Live demo:** https://0g.workagnt.ai (nginx vhost on server 18.169.225.49)
- **GitHub repo:** https://github.com/Evade7/workagnt-0g (public, All Rights Reserved license)
- **Deployed testnet contract:** `0xC2A7e42547a3C6C4d56879d6c5E35a532F49087b` (0G Galileo)
- **Deploy tx:** `0x7d9d963c3f3d01081507671357cbfcb65d44a8009b06e303266e575318891b57`
- **Explorer:** https://chainscan-galileo.0g.ai/address/0xC2A7e42547a3C6C4d56879d6c5E35a532F49087b
- **Testnet wallet:** `0x0ebf7C110E149153Cd544331435AC4AD5D15Ef2E` (private key in `contracts/.env`)

## Session 1 — Complete ✅

- [x] Scaffolded Vite + React 19 + TS + Tailwind app
- [x] Dark theme, Space Grotesk headings, design tokens
- [x] Routing (6 routes: Landing, Marketplace, AgentProfile, Hire, Job, MyJobs)
- [x] Navbar with Connect Wallet placeholder
- [x] LandingPage — hero, How it works (4 steps), Why 0G, Activity Feed, Featured Agents
- [x] MarketplacePage — agent grid with search + "Agent ID ready" badges
- [x] AgentProfilePage — profile card, stats, reputation placeholder
- [x] HirePage — brief + budget form with 0G badges
- [x] JobPage — state machine placeholder, 0G Compute CTA
- [x] MyJobsPage — wallet-not-connected skeleton
- [x] `lib/workagnt-api.ts` — standalone demo agent catalog (no external API deps)
- [x] `lib/zg-storage.ts` — JSON upload/download with SHA-256 fallback
- [x] `lib/zg-compute.ts` — broker wrapper with TEE verification
- [x] `lib/agentic-id.ts` — ERC-7857 metadata helpers
- [x] `contracts/AgntMarketplace.sol` — **native OG escrow** (refactored from ERC20)
- [x] Removed `AgntTestToken.sol` (no longer needed)
- [x] Simplified `script/Deploy.s.sol`
- [x] 7/7 Foundry tests passing (`vm.deal` + `{value: budget}` flow)
- [x] Installed Foundry, OpenZeppelin (ReentrancyGuard only)
- [x] **Deployed `AgntMarketplace` to 0G Galileo testnet**
- [x] Tailwind + framer + react-router installed
- [x] Frontend built + deployed to https://0g.workagnt.ai
- [x] Public GitHub repo created (`Evade7/workagnt-0g`) + first commit
- [x] Cleaned all external-product references from repo
- [x] License changed to **All Rights Reserved** (hackathon judging only)
- [x] Narrative pivot: "LinkedIn for AI agents" (not "onchain hiring layer")
- [x] New sections: Activity Feed + Featured Agents on landing
- [x] README updated to cover all 6 mandatory HackQuest sections
- [x] `0G_REFERENCE.md` — canonical 0G config + SDK patterns
- [x] **HackQuest checkpoint submitted** (Development stage)
- [x] **0G project registration form submitted**

## Blockers (to resolve for final submission)

- [!] **Mainnet contract address required.** Testnet deploy alone is insufficient per 0G integration proof rules. Need mainnet OG tokens (check DEXes, bridge from Ethereum, or ask 0G Discord for hackathon top-up).
- [!] **0G Compute SDK needs Node ≥ 22.** We have 20.18. Options: `nvm install 22 && nvm use 22` in `workagnt-0g/` only, or deep-link to hosted marketplace as fallback.
- [!] **0G Compute ledger requires 3 OG + 1 OG per provider.** Current wallet has ~0.1 OG (minus gas for deploy). Hit faucet daily or request top-up.

## Next Session — Session 2 Plan

Priority order:

1. **wagmi + RainbowKit setup** (~45 min)
   - `npm install wagmi viem @tanstack/react-query @rainbow-me/rainbowkit --legacy-peer-deps`
   - `src/lib/wagmi.ts` — define 0G Galileo chain: `{ id: 16602, name: '0G Galileo', nativeCurrency: { symbol: 'OG', decimals: 18 }, rpcUrls: { default: { http: ['https://evmrpc-testnet.0g.ai'] } }, blockExplorers: { default: { name: 'ChainScan', url: 'https://chainscan-galileo.0g.ai' } } }`
   - Wrap `App.tsx` with `WagmiProvider` + `QueryClientProvider` + `RainbowKitProvider`
   - Replace Navbar Connect Wallet button with `<ConnectButton />`

2. **`src/lib/contracts.ts` with real addresses + ABI** (~15 min)
   - Export `AGNT_MARKETPLACE_ADDRESS = '0xC2A7e42547a3C6C4d56879d6c5E35a532F49087b'`
   - Export typed ABI
   - Export `useReadContract` / `useWriteContract` helpers

3. **Wire real hire flow** (~1 hr)
   - `HirePage` → `useWriteContract({ functionName: 'postJob', args: [slug, brief], value: parseEther(budget) })`
   - `JobPage` → read job state, show role-based actions
   - `MyJobsPage` → filter by connected wallet
   - `AgentProfilePage` → pull `getAgentReputation` from contract

## Session 3+ Plan (sketch)

- **Session 3:** 0G Storage live uploads (real `uploadJson(signer)` → rootHash → store in contract)
- **Session 4:** 0G Compute (Node 22 upgrade, create ledger, fund provider, query Qwen 2.5 7B, verify TEE)
- **Session 5:** Mainnet deploy (after OG acquisition), demo video, final X post, HackQuest final submission

## Quick Commands (copy-paste ready)

```bash
# Local dev
cd ~/Desktop/wA/Wa-v2/workagnt-0g
npm run dev                              # http://localhost:5173

# Frontend build + deploy
npm run build
scp -i /Users/friday/Desktop/wA/Wa-v2/wrkagnt-web3/ai-backup-server.pem \
    -o StrictHostKeyChecking=no -r dist/* \
    ubuntu@18.169.225.49:/var/www/workagnt-0g/

# Contracts — tests
cd contracts
source /Users/friday/.zshenv
forge test

# Contracts — redeploy testnet
source .env
forge create --rpc-url https://evmrpc-testnet.0g.ai \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --evm-version cancun \
  --legacy --gas-price 2100000000 \
  --broadcast \
  src/AgntMarketplace.sol:AgntMarketplace

# Git
cd ~/Desktop/wA/Wa-v2/workagnt-0g
git add . && git commit -m "msg" && git push
```

## Gas Deploy Notes (learned the hard way)

- 0G Galileo testnet **requires** `--legacy --gas-price 2100000000` flags together
- `forge script` does NOT work — use `forge create` directly
- `--evm-version cancun` is mandatory (baked into `foundry.toml` now)
- Minimum priority tip: 2 gwei. Bumped to 2.1 gwei to avoid "too low" errors

## Submission Checklist (before May 16)

- [x] GitHub repo public with meaningful commits
- [x] README covers 6 mandatory sections
- [ ] Mainnet contract address + explorer link
- [x] 0G integration proof (testnet working, mainnet pending)
- [ ] ≤3 min demo video (Loom/YouTube)
- [ ] X post with name/screenshot/hashtags/tags
- [ ] HackQuest final submission filled

## Session Log

- **2026-04-14 evening** — Scaffolded app, deployed initial frontend to 0g.workagnt.ai
- **2026-04-15** — Nginx SSL fix, checkpoint submissions, 0G SDKs installed
- **2026-04-16 Session 1** — Native OG refactor, contract deployed to testnet, LinkedIn-for-AI narrative, Activity Feed + Featured Agents, license to All Rights Reserved, README finalized

## Decisions Made

- **Narrative:** "LinkedIn for AI agents" (not "onchain hiring layer") — differentiates from zer0Gig (Upwork-for-agents competitor)
- **Escrow currency:** native OG on testnet (refactored from AGNT-TEST ERC20). Mainnet may use a different token.
- **License:** All Rights Reserved (not MIT) — hackathon judging only
- **Tracks:** 3 (primary), 1 + 5 (cross). Not 4 — avoid overclaim.
- **Eligibility category:** "existing prototype further developed and deployed on 0G during the hackathon"
- **Skipped:** 0G DA (too heavy — GPU nodes + Docker); Track 2 (no trading bot fit); Track 4 (wildcard dilutes pitch)
