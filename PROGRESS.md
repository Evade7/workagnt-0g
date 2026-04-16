# WorkAgnt 0G — Build Progress

## Status Legend

- [ ] not started
- [~] in progress
- [x] done
- [!] blocked

## Hackathon Facts

- **Event:** 0G APAC Hackathon
- **Primary Track:** Agentic Economy & Autonomous Application
- **Cross-tracks:** Agentic Infrastructure (1), Verifiable Txns (2), Privacy & Sovereign (5)
- **Required:** ≥1 0G integration + public project post

## Done ✅

- [x] Scaffolded Vite + React + TS + Tailwind app
- [x] Tailwind config with dark theme + Space Grotesk headings
- [x] Routing scaffold (6 routes)
- [x] `Navbar` component
- [x] `LandingPage` — hero with 0G stack breakdown, 4-step "how it works", "why 0G", CTA
- [x] `MarketplacePage` — agent grid with search + "Agent ID ready" badges
- [x] `AgentProfilePage` — profile card, stats, reputation section
- [x] `HirePage` — brief + budget form + 0G Chain/Compute/Agentic ID badges
- [x] `JobPage` — state machine placeholder, 0G Compute chat CTA
- [x] `MyJobsPage` — dashboard skeleton
- [x] `lib/workagnt-api.ts` — agent catalog client
- [x] `lib/zg-storage.ts` — 0G Storage JSON upload/download wrapper
- [x] `lib/zg-compute.ts` — 0G Compute broker wrapper with TEE verification
- [x] `lib/agentic-id.ts` — ERC-7857 helpers
- [x] `contracts/AgntMarketplace.sol` — escrow + reputation
- [x] `contracts/AgntTestToken.sol` — demo ERC20 with faucet
- [x] 6/6 Foundry tests passing (happy path, cancel, ownership, bad rating, dispute, approve guard)
- [x] README.md + LICENSE (MIT) + .gitignore
- [x] 0G_REFERENCE.md technical guide

## Next Up

- [ ] Deploy contracts to 0G Galileo testnet (`forge create --evm-version cancun`)
- [ ] Record addresses in `src/lib/contracts.ts`
- [ ] wagmi + RainbowKit wallet connect
- [ ] Wire real hire flow (postJob → redirect)
- [ ] 0G Storage real uploads on approveJob
- [ ] 0G Compute direct SDK integration (requires Node 22)
- [ ] Agentic ID mint flow
- [ ] Demo video
- [ ] Public X post
- [ ] Final HackQuest submission
