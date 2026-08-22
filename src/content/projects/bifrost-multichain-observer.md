---
title: Bifrost Multichain Observer
summary: Watches bridge contract events and Bitcoin UTXOs across 7+ chains, and serves them as a REST API.
icon: 🔗
dateStart: 2022-05-30
dateEnd: 2025-04-30
stacks: [FastAPI, MySQL (MariaDB), Python, uvicorn]
topics: [API, Blockchain, DB, Web3]
scale: Big
featured: true
links:
  - label: Bifrost Bridge
    url: https://www.bifrostnetwork.com/bridge
---

Built and maintained the Multichain Observer, a core piece of the BIFROST Network's infrastructure.
It does three things: records event data from Bifrost Bridge contracts, serves that data over a REST API, and flags abnormal conditions in the bridge.

![Bifrost Multichain Observer architecture](../../assets/projects/bifrost-multichain-observer/architecture.png)

- **Sole owner** of the service, in Python 3 on FastAPI with uvicorn.
- **Persisted bridge contract events** to MariaDB, structured for reliable retrieval.
- **Aggregated and exposed the data** through a REST API used by internal systems.
- **Detected anomalies** in the bridge, so irregularities could be caught before they became incidents.
