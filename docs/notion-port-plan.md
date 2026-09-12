# Port the Notion CV to an Astro static site — Cloudflare Pages canonical, Swarm mirror

## Context

`yjkellyjoo.dev` currently serves a **Cloudflare 302 redirect to `yjkellyjoo.notion.site`** — not a Notion custom-domain integration, not super.so. DNS is already on Cloudflare (`may.ns` / `venkat.ns`). The goal is to replace that with an owned Astro static site, and ultimately host it on Swarm the way the Foundation hosts its own properties (`ethswarm-nextjs`, `ethswarm-blog-hugo`, `bee-docs` → `*.swarm.bzz.link`).

Source material is the Notion HTML export in the working directory (a zip nested inside a zip), containing the main CV page, 16 project detail HTML files, and ~10 MB of assets.

**Already done:** `yjkellyjoo/cv` exists on GitHub, public, with a minimal Astro 7.2.4 scaffold pushed to `main` (commit `58ed4e9`). `trailingSlash: 'always'` and `build.format: 'directory'` are already pinned in `astro.config.mjs`; `site` is set to `https://yjkellyjoo.dev`. Build and `astro check` are clean.

## Decisions

| | |
|---|---|
| Canonical home | `yjkellyjoo.dev`, served by **Cloudflare Pages** |
| Swarm role | Verifiable mirror at `yjkellyjoo.eth.limo`, `rel=canonical` → `.dev` |
| Project detail | **One `/projects/` route**, 15 anchored sections — no per-project routes |
| Migration | **Hand-port everything.** No HTML→Markdown converter script |
| Design | Restrained editorial, developer accent |
| PDF | Print stylesheet now; CI-generated PDF later |
| Assets kept | Profile photo, self-hosted thesis PDF. **GitHub stats widgets dropped** |
| Postage batch | **New mutable batch, depth 19, ~1 year** — wallet must be funded first |
| Swarm deploy | **Self-hosted GitHub runner** on the node machine, `bee-url: http://localhost:1633` |
| Languages | English now; collections keyed by locale so `/ko/` is additive |
| Extras | `mailto:` link, dark/light toggle, stack filter. **No analytics** |
| Accent | **Deep ink blue** — `oklch(48% 0.14 250)` light / `oklch(74% 0.12 250)` dark |
| Attribution | Agent commits authored **`jelly-claw <jelly-claw@proton.me>`** (repo-local git config); `gh` active as `jelly-claw`, so PRs are opened and assigned to it |

### Facts established during planning

- `yjkellyjoo.eth` resolves (`0x270C99E0E1409F63A83adb2Db4fbEB5752b0fBC2`) — so the mirror gets a real ENS address, not just a hash URL.
- Bee node at `100.113.72.122:1633` (Tailscale): **v2.8.1, full mode**, healthy, chequebook + swap enabled.
- Node wallet `0xd450efd0ab5d3afcf4fd4bdfa687aa7c387738b8` holds **18.37 xBZZ** and 1.23 xDAI.
- Existing batch `df2d7ef5…787b` is **immutable**, depth 19, fullest bucket already at 50%, TTL ~56 days. Unsuitable — per Bee docs, an immutable batch *"becomes unusable once its capacity is filled"*, and *"the entire batch is considered fully utilised as soon as any one of its buckets is filled"*. It is not reused.
- `swarm-cli` 3.4.0 is installed locally; `--immutable` defaults to **true**.
- Project body content is thin: median ~150 words, AuthLegacy is a **12-word stub**, ~2,300 words total across all 15. This is why they became anchored sections rather than 15 routes.

## Routes

```
/            index — hero, about, experience, selected work, research, education, contact
/projects/   all 15 projects as anchored sections (/projects/#pet-id), stack filter
/404.html   emitted at the root by Astro, not as a directory — also the manifest error-document
```

`/` shows ~5 featured projects as cards linking into `/projects/#<slug>`. Everything else lives on `/projects/`.

## Content model

`src/content.config.ts` (Astro 5+ location) with Zod-typed collections. Every collection carries a `lang` field defaulting to `'en'`, and Astro i18n is configured with `defaultLocale: 'en'`, `prefixDefaultLocale: false`, so English stays at the root and adding `ko` later is additive rather than a refactor.

- `projects` — `title, icon?, summary, dateStart, dateEnd?, stacks[], scale: 'Small'|'Medium'|'Big', featured, links[]`. Mirrors the Notion DB properties. The anchor slug is the loader's entry `id` (the filename), not a frontmatter field. `links` is an array of `{label, url}`, not a single `productLink`: 10 of the 15 export pages carry two or more outbound links (OnChainFund has five), and the verification below requires every one of them to survive.
- `awards` — dated by `year` only. The export never dates an award more precisely, so a full date would mean inventing months.
- `experience` — `role, org, orgUrl?, dateStart, dateEnd?, blurb, stacks[]`; achievement bullets as Markdown body, preserving inline links (docs.status.network, the four Status tooling repos, docs.api.bifrostnetwork.com).
- `education`, `research`, `publications`, `awards` — 4 / 3 / 2 / 3 entries.

Sidebar data (contact, languages, skills, socials) is not page-like → `src/data/profile.ts`, a plain typed module.

Derived, never duplicated: the projects list, the "Tools & Skills" tag cloud, and the filter's technology options are all computed from the `projects` collection at build time.

## Migration

Extract the export once into a gitignored `notion-export/` (already covered by `.gitignore`), then hand-port. No converter script — 2,300 words is less typing than debugging turndown against Notion's KaTeX spans, percent-encoded emoji paths, and nested `column-list` divs, and every file needs an editorial pass regardless.

Fold the editorial pass in while porting:

- **AuthLegacy needs actual content written** — 12 words is not a section. This one needs input that isn't in the export.
- Replace the KaTeX name/title equation with a real `<h1>` + tagline.
- Rewrite `In charge of…` phrasing into active voice.
- Drop the `^go back to main page` trailers and the `^ click on the title for details` note — navigation replaces them.
- Convert `I$^3$` → `I³`, keep Korean research titles inline alongside the English as the Notion page does (they're cited that way).
- Replace remote icons (`app.notion.com/icons/*`, `github.githubassets.com`, `cdn4.iconfinder.com`) with local SVG or the existing `data-emoji` values. **No third-party requests in the final build.**

Assets: profile photo → `src/assets/`, through Astro `<Image>` (~60–90 KB webp, from 6.2 MB). Thesis PDF → `public/thesis/prosmart.pdf`. Project diagrams → `src/assets/projects/`.

## Design

Restrained editorial with a developer accent — generous whitespace, strong type hierarchy, one accent colour, monospace reserved for stack pills and inline code. System font stack, no web fonts. Design tokens as CSS custom properties in `src/styles/global.css` so the accent and type scale are single-value knobs.

- **Hero** — real `<h1>`, modest photo (not a full-bleed hero), the trilingual/4-years summary cut to two lines, inline contact and socials.
- **Experience** — vertical timeline; date + duration badge (`10m.`, `3y.`) on the rail, role/org/blurb/bullets/stack pills in the body, current role marked.
- **Selected work** — ~5 featured cards → `/projects/#<slug>`.
- **Research & Publications** — promoted out of Notion's collapsed toggle into a real section; funded projects with support organization, then both publications with abstracts and pdf/demo links.
- **Education** — compact; degree, institution, field, GPA.
- **`/projects/`** — anchored sections with a stack filter (~1 KB vanilla JS, degrades to the full list).
- **Theme** — `prefers-color-scheme` plus a persisted toggle (~0.5 KB inline JS). Only other JS on the site.
- **Print** — `@media print`: hide nav/toggle/filter, linearize, expand links to visible URLs, force sensible page breaks so `Cmd-P` yields a usable PDF.
- **"Last updated"** — derived from the git commit date at build time, replacing Notion's hand-maintained `@2026-08-06`.

## Swarm

### Postage batch — do this before the first upload

The wallet is **6.8 xBZZ short**. Fund `0xd450efd0ab5d3afcf4fd4bdfa687aa7c387738b8` with ~7+ xBZZ, then:

```sh
# amount = currentPrice × blocks/year = 76010 × 6,307,200 ≈ 479,410,272,000
# Recompute from /chainstate at purchase time — currentPrice drifts.
swarm-cli stamp buy --depth 19 --amount 479410272000 --immutable false \
  --label cv --bee-api-url http://100.113.72.122:1633
```

Depth 19 for 1 year ≈ **25.13 xBZZ**.

**Verify mutability immediately** — `--immutable` defaults to `true` and cannot be changed after purchase:

```sh
curl -s http://100.113.72.122:1633/stamps | jq '.stamps[] | select(.label=="cv") | {batchID, depth, immutableFlag, batchTTL}'
```

`immutableFlag` must be `false`. If it is `true`, the batch is wrong — buy again rather than working around it.

### Deploy

Self-hosted GitHub Actions runner on the node machine, so the node never leaves localhost and no Tailscale auth keys land in a public repo. `.github/workflows/swarm-upload.yml` follows the Foundation pattern:

```
build → swarm-actions/upload-dir (dir: ./dist, index-document: index.html)
      → swarm-actions/write-feed (topic: "yjkellyjoo-cv", signer)
      → swarm-actions/reference-to-cid
```

with `bee-url: http://localhost:1633` and repo secrets `SWARM_POSTAGE_BATCH_ID`, `SWARM_SIGNER`. The signer is a **dedicated feed key holding no funds** — not the node wallet key.

Then point `yjkellyjoo.eth`'s contenthash at the resulting feed manifest so the mirror lives at `yjkellyjoo.eth.limo`, and link it from the site footer.

### Build constraints that make Swarm work

1. `trailingSlash: 'always'` + `build.format: 'directory'` — already set. Every route emits `<route>/index.html`, matching `index-document: index.html`.
2. **Use the CID-subdomain or ENS URL, never the path form.** Astro emits root-absolute asset URLs (`/_astro/…`), which 404 under `https://bzz.link/bzz/<ref>/…` but resolve under `https://<cid>.bzz.link/` or `yjkellyjoo.eth.limo`. Local Bee preview: `http://<cid>.localhost:1633/`.
3. No server rewrites exist — ship a real `404.astro`.
4. `rel=canonical` → `https://yjkellyjoo.dev` on both copies, so the mirror doesn't compete in search.

## Cloudflare Pages + cutover

Connect `yjkellyjoo/cv` to Cloudflare Pages (build `npm run build`, output `dist`). Add `yjkellyjoo.dev` as a custom domain — same account already holds the zone, so cert and DNS are handled without hand-maintained A records or a `CNAME` file.

**The cutover is deleting the existing Cloudflare redirect rule** that sends `yjkellyjoo.dev` → `yjkellyjoo.notion.site`. That rule fires before any origin, so the site stays on Notion until it's removed. Do this last, after the built site is verified.

## Delivery

Shipped as milestones, not one push. Each milestone stops for review before the next begins.

**Per-milestone loop:**

1. Branch off `main`.
2. `/mattpocock-skills:implement` — build the milestone.
3. `/commit` — split into logical commits.
4. `/open-pr` — raise the PR.
5. `/mattpocock-skills:code-review` — review the PR.
6. **Stop.** Report the result; you review and merge before the next milestone starts.

### M0 — Repo config

`/mattpocock-skills:setup-matt-pocock-skills` (issue tracker, triage labels, domain docs). Extract the Notion export to the gitignored `notion-export/`. Config only, so the review is trivial — but it's what the later engineering skills read from.

### M1 — Foundations

`src/styles/global.css` design tokens, `BaseLayout.astro`, Astro i18n config (`defaultLocale: 'en'`, `prefixDefaultLocale: false`), `content.config.ts` schemas, `src/data/profile.ts`. No CV content yet.

*Review target: schema shape and token vocabulary — the two things expensive to change later.*

**Decisions locked while building M1** — these bind the later milestones:

- **Entry `id` is the slug.** The glob loader's filename-derived `id` is the anchor; there is no separate
  `slug` frontmatter field, so there is one source of truth rather than two that drift.
- **Colour resolves through `light-dark()`**, each token declared once. M4's theme toggle is therefore a
  single `color-scheme` override on `:root`, not a duplicated palette.
- **`z` comes from `astro/zod`**, not `astro:content` (deprecated, removal announced for Astro 7). Zod 4
  wants `z.url()`, not `z.string().url()`.
- **`astro.config.mjs` → `astro.config.ts`**, so the config imports `LOCALES` from `src/i18n/config.ts`
  instead of restating them.
- **`npm run verify` is the real gate**, not `npm run build`. `astro build` exits **0** when a
  `reference()` dangles — it only logs `[ERROR]`. M2 wires research, publications and awards to projects,
  so without this a typo'd reference ships silently. `scripts/verify-build.mjs` fails on that and on any
  route not built as `<route>/index.html`.

### M2 — Content migration

Hand-port every collection: 4 experience, 4 education, 3 research, 2 publications, 3 awards, 15 projects. Optimize the photo and project diagrams through `src/assets/`; place the thesis PDF. **Needs your AuthLegacy content.**

*Review target: content parity against `notion-export/`, and the editorial rewrite.*

### M3 — Pages

`/` sections (hero, about, experience timeline, selected work, research, education, contact), then `/projects/` with anchored sections and the stack filter, plus `404.astro`.

*Review target: the redesign itself — first point where it's visible.*

### M4 — Polish

Theme toggle, print stylesheet, git-derived "last updated", `rel=canonical`, Open Graph tags, accessibility pass, no-JS verification.

### M5 — Cloudflare Pages

Connect the repo, build `npm run build` → `dist`, add `yjkellyjoo.dev` as custom domain, verify on the `*.pages.dev` URL. **Redirect rule stays in place — no cutover yet.**

*Requires you: Cloudflare dashboard access.*

### M6 — Swarm mirror + cutover

Fund wallet → buy mutable batch → verify `immutableFlag: false` → self-hosted runner → `swarm-upload.yml` → verify via CID-subdomain → set `yjkellyjoo.eth` contenthash. **Then, last of all, delete the Cloudflare redirect rule.**

*Requires you: ~7+ xBZZ into the wallet, runner registration, ENS transaction, Cloudflare dashboard.*

M5 and M6 are independent of each other — the site can ship on `.dev` before the Swarm mirror exists. Only the cutover is strictly last.

## Verification

**Build**
- `npm run check` and `npm run build` clean.
- `find dist -name '*.html' -not -name 'index.html' -not -name '404.html'` → empty (constraint 1).
  Astro emits `404.html` at the root regardless of `build.format`, so it must be excluded or the check fails falsely.
  That root `404.html` is also the path to hand to the manifest's error-document on upload.
- `grep -rE 'notion\.(so|com)|amazonaws\.com|github-readme-stats|githubassets|iconfinder' dist/` → empty.
  Catches leftover Notion links, expiring S3 asset URLs, the dropped stats widgets, and remote icons.
  Note it matches `github-readme-stats`, not bare `vercel.app` — three projects legitimately link
  Vercel-hosted demos, so the broader pattern would false-fail.
- Lighthouse on `astro preview`; photo well under 100 KB.
- Print preview (`Cmd-P`) produces a clean, page-broken CV.
- Disable JS: `/projects/` still lists all 15, theme still follows system preference.

**Content parity** — against `notion-export/`: 4 experience, 4 education, 3 funded research, 2 publications, 3 awards, 15 projects, and every outbound link from the export present.

**Swarm** — before the cutover, since this is what catches path-resolution bugs:
- Upload, then open the feed manifest via the **CID-subdomain** form; confirm CSS, images, and in-page anchors load. HTML rendering but assets 404ing means constraint 2.
- Request a bad path → 404 page served.
- Re-deploy after a trivial edit → same feed manifest URL serves the new version.
- Confirm `yjkellyjoo.eth.limo` resolves once contenthash is set.

**Cutover** — `curl -I https://yjkellyjoo.dev` returns 200 from Cloudflare Pages, not a 302 to `notion.site`.

## Needs input from you

- **AuthLegacy content** — the export has 12 words; the section needs real material.
- **~7+ xBZZ** into the node wallet before the batch purchase.
