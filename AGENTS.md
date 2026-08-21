## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## This project

A CV / personal site ported from a Notion export, deployed to Cloudflare Pages and mirrored to Swarm.

Swarm hosting constrains the build in three ways — see the README for the full reasoning:

- Keep `trailingSlash: 'always'` and `build.format: 'directory'` in `astro.config.ts`. Every route must build as `<route>/index.html`.
- Keep the payload small. No web fonts, no client-side framework; every byte becomes a paid-for Swarm chunk.
- Small amounts of self-contained vanilla JS are fine (theme toggle, project filter). The constraint that matters is self-containment: an upload must render from its own manifest alone, so no third-party requests at runtime.

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (`yjkellyjoo/cv`), via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
