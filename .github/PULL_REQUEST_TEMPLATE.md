# What does this PR resolve? 🚀

<!-- One-line summary. Then bullets: the key changes and, briefly, the why. -->

# Details 📝

<!-- Implementation specifics, trade-offs, anything a reviewer needs. -->

# Checklist ✅

- [ ] Merged latest `main` and resolved conflicts
- [ ] `npm run check` and `npm run build` both pass
- [ ] Every route still builds as `<route>/index.html` — `find dist -name '*.html' -not -name 'index.html' -not -name '404.html'` is empty (Astro emits `404.html` at the root by design)
- [ ] No new third-party requests at runtime (the Swarm copy must render from its own manifest)
- [ ] Docs updated where relevant (`README.md`, `AGENTS.md`, `docs/agents/`)
- [ ] Self-reviewed the diff
- [ ] PR title follows Conventional Commits
