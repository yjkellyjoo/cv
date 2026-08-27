---
title: 'AuthLegacy: provenance for physical goods'
summary: Blockchain-backed record of a physical object's history, authenticity and ownership.
logo: ../../assets/icons/authlegacy.svg
dateStart: 2024-11-15
dateEnd: 2024-11-17
stacks: [Next.js, TypeScript, TailwindCSS, wagmi, viem]
topics: [Blockchain, NFT, Web3]
scale: Small
links:
  - label: Showcase
    url: https://ethglobal.com/showcase/authlegacy-roch4
  - label: Source code
    url: https://github.com/authLegacy/auth-legacy
  - label: Pitch deck
    url: https://www.canva.com/design/DAGWoq-ITlE/tPekMg5XMg1sa1PuSJIcAA/view
---

**Blockscout Explorer and Coinbase Developer Platform OnchainKit pool prizes, ETHGlobal Bangkok 2024.**

Every item tells a story, and nothing durable carries it.
Authenticity, ownership and lifecycle data for physical goods sit in paper certificates and private databases that rarely survive a resale — which is the gap a counterfeit market worth $500B+ a year trades in, and the reason regulation like the EU's Digital Product Passport is arriving to close it.
AuthLegacy puts that record on-chain instead, so provenance travels with the object rather than with whoever last held the paperwork.

## How it works

Three roles against one attested record:

- **Sellers** upload the item and its documentation.
- **Attestors** — professional validators, at least two per item — verify it, and are paid out for the verification.
- **Buyers** see only items that passed, and buy against NFT-backed proof.

An item is minted as an NFT on upload, and authenticity, ownership and lifecycle history accumulate on that token from there.
Listing is gated on attestation, so nothing unverified reaches the marketplace.

## My role

Team and product lead across the two days.

- Ran the team of four and split the work across the frontend, contracts and design tracks.
- Held the scope to what four people could actually finish in 48 hours, and decided what shipped when the deadline forced a cut.
- Wrote the project documentation the submission was judged from.

## Why it is worth putting on-chain

The provenance record is the product, so it has to outlive the platform that issued it — an immutable one does, a company database does not.
Two things follow from that.
A resale keeps its history, which is what makes reuse worth more than replacement.
And traceability that a regulator can check is a by-product of the same record, rather than a second compliance system built alongside it.

**Stack:** Next.js, TypeScript, TailwindCSS; OnchainKit (Coinbase Developer Platform, on Base), ethers.js, wagmi, viem; Lighthouse for storage.
