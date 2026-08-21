# cv

Source for my CV / personal site at [yjkellyjoo.dev](https://yjkellyjoo.dev), replacing the Notion page it used to serve.

Built with [Astro](https://astro.build) as a fully static site, deployed to Cloudflare Pages and mirrored to [Swarm](https://ethswarm.org).

## Status

Barebones scaffold. Content migration from the Notion export is not done yet.

## Develop

```sh
npm install
npm run dev      # dev server on localhost:4321
npm run build    # static build to ./dist
npm run preview  # serve ./dist locally
npm run check    # type-check
npm run verify   # build, then assert the Swarm invariants hold
```

`verify` exists because `astro build` exits 0 on two failures that matter here: a dangling
content `reference()` only logs an error, and a route built as `<route>.html` instead of
`<route>/index.html` works on Cloudflare Pages while 404-ing on Swarm.

## Deploying

### Cloudflare Pages (primary)

Pushes to `main` build and publish to `yjkellyjoo.dev`.

### Swarm (mirror)

Until the runner is wired up, uploads are manual via [swarm-cli](https://github.com/ethersphere/swarm-cli), against a Bee node with a funded **mutable** postage stamp:

```sh
npm install --global @ethersphere/swarm-cli   # once
swarm-cli identity create cv                 # once — creates the feed signing key
swarm-cli stamp create                       # once — interactive: size + TTL, returns a Stamp ID

npm run build
swarm-cli feed upload dist \
  --identity cv --password "$SWARM_IDENTITY_PASSWORD" --stamp "$SWARM_STAMP_ID"
```

`feed upload` prints a **Feed Manifest URL** that stays constant across re-uploads, so it can be linked or pointed at from an ENS contenthash.

CI-based upload — the [`ethersphere/swarm-actions`](https://github.com/ethersphere/swarm-actions) pipeline that
[ethswarm-nextjs](https://github.com/ethersphere/ethswarm-nextjs),
[ethswarm-blog-hugo](https://github.com/ethersphere/ethswarm-blog-hugo) and
[bee-docs](https://github.com/ethersphere/bee-docs) all use — needs a Bee node reachable from the runner. Those repos run on self-hosted runners because the Bee gateway enforces a source-IP allowlist. This repo will do the same: a self-hosted runner on the machine hosting the Bee node, reaching it over `localhost`. Wiring that up is still pending.

## Swarm hosting constraints

Two build settings are load-bearing. Get them wrong and the site still works on Cloudflare Pages while breaking on Swarm.

1. **`trailingSlash: 'always'` with `build.format: 'directory'`** (`astro.config.ts`) so every route emits `<route>/index.html`, which is what the uploaded manifest's `index-document: index.html` resolves against.
2. **Use the CID-subdomain or ENS URL, never the path form.** Astro emits root-absolute asset URLs (`/_astro/…`). Those 404 under `https://bzz.link/bzz/<ref>/…` but resolve correctly under `https://<cid>.bzz.link/` or a `.eth.limo` address. For local Bee previews, use the subdomain form too: `http://<cid>.localhost:1633/`.

Payload size also matters more than usual, since every byte becomes a paid-for chunk — hence no web fonts and no client-side framework.

Small amounts of self-contained vanilla JS are fine, though. The constraint that actually binds is self-containment: an uploaded manifest must render on its own, so anything making a third-party request at runtime is what breaks it — not a kilobyte of inline script.

## Source material

The Notion HTML export this site is ported from is deliberately not committed (see `.gitignore`).
