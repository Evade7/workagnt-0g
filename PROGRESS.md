# WorkAgnt 0G — Build Progress

Resume file. Update at every session boundary so work survives a restart.

## Status Legend

- [ ] not started
- [~] in progress
- [x] done
- [!] blocked

## Deployment

- **Live URL:** https://0g.workagnt.ai (served from server 18.169.225.49, nginx vhost `workagnt-0g`, root `/var/www/workagnt-0g/`)
- **DNS:** Cloudflare A record `0g` → `18.169.225.49`, proxied (orange cloud)
- **SSL:** reuses existing `web3.workagnt.ai` Let's Encrypt cert (works behind Cloudflare Full SSL)
- **Deploy command from local:** `npm run build && scp -i ../wrkagnt-web3/ai-backup-server.pem -r dist/* ubuntu@18.169.225.49:/var/www/workagnt-0g/`

## Hackathon Facts

- **Event:** 0G APAC Hackathon 2026 ($150K pool)
- **Deadline:** May 9, 2026 23:59 UTC+8
- **Track:** Autonomous Agent Economies (primary); cross-track: AI Agent Frameworks, Verifiable On-chain Transactions
- **Submission platform:** HackQuest
- **Must include:** at least one 0G integration + public X post

## Done ✅

- [x] Scaffolded Vite + React + TS + Tailwind app at `workagnt-0g/`
- [x] Vite downgraded to v5 (Node 20.18 compatibility)
- [x] Tailwind config with shared design tokens from main WorkAgnt (bg/surface/pink/purple + zg green accent)
- [x] Dark theme + Space Grotesk headings + `text-gradient` utilities
- [x] Routing scaffold (`BrowserRouter` with 6 routes)
- [x] `Navbar` component with "Connect Wallet" placeholder
- [x] `LandingPage` — hero with live stats (137/48/176), 3-step "how it works", "why 0G", footer CTA
- [x] `MarketplacePage` — fetches live agents from `workagnt.ai/api/v1/agents/discover`, search, "Agent ID ready" badges
- [x] `AgentProfilePage` — profile card, stats, reputation section
- [x] `HirePage` — brief + budget form, "escrow coming soon" stub
- [x] `JobPage` — state machine placeholder, chat redirect to main WorkAgnt
- [x] `MyJobsPage` — dashboard skeleton with wallet-not-connected state
- [x] `lib/workagnt-api.ts` — typed client for production `/api/v1/agents/discover`
- [x] README.md (judges-ready) with architecture, stack, roadmap, differentiators
- [x] LICENSE (MIT)
- [x] .gitignore hardened (env/pem/foundry)
- [x] `npm run build` succeeds (449 modules, 377KB JS / 14.5KB CSS)
- [x] Deployed to 0g.workagnt.ai via existing server + nginx vhost
- [x] Verified title renders correctly (`<title>workagnt-0g</title>`)

## In Flight 🔨

*(all pending — next session picks up here)*

## Next — Week 2 (Contract + Wallet)

- [ ] Install Foundry (`curl -L https://foundry.paradigm.xyz | bash && foundryup`)
- [ ] Initialize `contracts/` with `forge init --force`
- [ ] Write `contracts/src/AgntMarketplace.sol`
  - `postJob(string agentSlug, string brief, uint256 budget)` → locks ERC20 escrow
  - `acceptJob(uint256 jobId)` → agent owner only
  - `completeJob(uint256 jobId, bytes32 deliverableHash)` → agent posts 0G Storage CID
  - `approveJob(uint256 jobId, uint8 rating)` → client approves, funds release, rating recorded
  - `disputeJob(uint256 jobId)` → locks pending (manual V0)
  - `getAgentReputation(string slug)` → cumulative karma + completed jobs
- [ ] Deploy **demo ERC20** (`AgntTestToken.sol`) with mint-for-all for testing
- [ ] `forge test` — happy path + dispute + insufficient balance cases
- [ ] Deploy both contracts to 0G Galileo testnet (RPC: `https://evmrpc-testnet.0g.ai`, chainId: TBD — verify in 0G docs)
- [ ] Verify on 0G explorer
- [ ] Record addresses in `src/lib/contracts.ts`

## Next — Week 2 (Frontend Web3)

- [ ] Install `@rainbow-me/rainbowkit` + `@tanstack/react-query` + `viem`
- [ ] Create `src/lib/wagmi.ts` with 0G Galileo chain definition
- [ ] Wrap `App.tsx` with `WagmiProvider` + `QueryClientProvider` + `RainbowKitProvider`
- [ ] Replace Navbar "Connect Wallet" button with `<ConnectButton />`
- [ ] `src/lib/contracts.ts` — ABIs + read/write hooks (`useReadContract`, `useWriteContract`)
- [ ] Wire `HirePage` submit → `postJob` txn
- [ ] Job page reads state from contract, shows accept/complete/approve buttons per role
- [ ] My Jobs page reads past jobs filtered by connected wallet

## Next — Week 3 (0G Storage + Agent ID)

- [ ] Install 0G Storage SDK (check docs for current package)
- [ ] `src/lib/zg-storage.ts` — upload JSON blob + return CID, download by CID, verify hash
- [ ] On `approveJob`, append a reputation entry to agent's 0G Storage blob, update hash on-chain
- [ ] Agent profile reads reputation from 0G Storage via hash lookup
- [ ] Research 0G Agent ID standard docs — design mint flow per agent listing
- [ ] (Stretch) Mint one Agent ID per live WorkAgnt agent via a script

## Next — Submission Prep

- [ ] Update landing page "Connect Wallet" CTA now that it actually works
- [ ] Write `src/pages/AboutPage.tsx` — team, district hackathon win, roadmap post-hackathon
- [ ] Rebuild + redeploy to 0g.workagnt.ai
- [ ] Record demo video (~2 min, Loom) walking through: connect → browse → hire → complete → rating persisted
- [ ] Draft + publish public X post on @WorkAgnt with project link + #0GHackathon
- [ ] Push code to new GitHub repo (e.g. github.com/workagnt/workagnt-0g), public
- [ ] Fill HackQuest submission: description + progress + fundraising + contract address + deployed link + GitHub + X post URL
- [ ] Submit before **May 9, 2026 23:59 UTC+8**

## Form Field Drafts (paste-ready)

Description, Progress During Hackathon, Fundraising Status drafts live in team TG history — reuse verbatim.

## Open Questions

1. **0G testnet chainId + faucet URL** — verify in https://docs.0g.ai before writing wagmi config
2. **0G Agent ID contract address / standard** — verify if it's a live deployed standard or a specification we implement
3. **0G Storage SDK package name + auth** — check which npm package is canonical
4. **Judging criteria** — on HackQuest, confirm if submissions allow live-platform demos or require everything in-repo

## Known Issues

- Cloudflare cache may serve stale content — use "Custom Purge → by URL" for `0g.workagnt.ai/*` only, avoid purging all (main site).
- `workagnt-0g` dev server collides with main app; uses port 5175 locally.

## Quick Commands

```bash
# Local dev
cd ~/Desktop/wA/Wa-v2/workagnt-0g
npm run dev

# Build + deploy
npm run build
scp -i ../wrkagnt-web3/ai-backup-server.pem -r dist/* ubuntu@18.169.225.49:/var/www/workagnt-0g/

# SSH to server
ssh -i ../wrkagnt-web3/ai-backup-server.pem ubuntu@18.169.225.49
```

## Session Log

- **2026-04-14 evening** — Scaffolded app, pages, README, deployed to 0g.workagnt.ai
- **2026-04-15 morning** — Fixed nginx 443 listener, confirmed live site
- **Paused here** — next: Foundry + wallet connect
