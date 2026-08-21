# What does this PR resolve? 🚀

<!-- One-line summary. Then bullets: the key changes and, briefly, the why. -->

# Details 📝

<!-- Implementation specifics, trade-offs, anything a reviewer needs. -->

# Checklist ✅

- [ ] Merged latest `main` and resolved conflicts
- [ ] `npm run check` and `npm run build` both pass
- [ ] Every route still builds as `<route>/index.html` — `find dist -name '*.html' -not -name 'index.html'` is empty
- [ ] No new third-party requests at runtime (the Swarm copy must render from its own manifest)
- [ ] Docs updated where relevant (`README.md`, `AGENTS.md`)
- [ ] Self-reviewed the diff
- [ ] PR title follows Conventional Commits
