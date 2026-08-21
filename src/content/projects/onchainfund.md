---
title: 'OnChainFund: Decentralized Crowdfunding'
summary: Milestone-gated crowdfunding on Base, where backers vote to release each tranche of USDC.
logo: ../../assets/icons/onchainfund.jpg
dateStart: 2025-05-01
dateEnd: 2025-05-17
stacks: [Blockchain, Solidity, TypeScript, Web3, stablecoin]
scale: Medium
featured: true
links:
  - label: Showcase
    url: https://devfolio.co/projects/onchainfund-3574
  - label: Live demo
    url: https://on-chain-fund-vert.vercel.app/home
  - label: Source code
    url: https://github.com/on-chain-fund/on-chain-fund
  - label: Pitch deck
    url: https://www.beautiful.ai/player/-OQOuMRaOgT-F7lbEPMX
  - label: Announcement
    url: https://x.com/base/status/1930352108693533023
---

A decentralized crowdfunding platform on Base, built to give Web3 creators and their backers a funding
process neither side has to take on trust. Campaigns are funded in USDC against milestones, and backers
vote to release each tranche — 70% approval required.

**2nd place, Stablecoin track, Base Batches 001 APAC**, out of 800+ global projects.

## My role

- Collaborated on the prototype design, working through inconsistent code and unfinished milestone logic.
- Built and refined the MVP, concentrating on the smart contracts.
- Deployed the contracts to Base mainnet and integrated CDP OnchainKit.

## Trade-offs

Base Sepolia's OnchainKit documentation didn't cover anything past wallet connection, so integration
stopped there. Testing needed a mock USDC token deployed to mainnet as a workaround. The voting logic is
still unfinished.

## Where it goes next

A Paymaster for gasless UX, and a Farcaster Mini App for real-time voting and milestone updates.
