import { defineConfig } from 'astro/config';

import { DEFAULT_LOCALE, LOCALES } from './src/i18n/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://yjkellyjoo.dev',

	// Swarm serves this site from an uploaded manifest with
	// `index-document: index.html`, so every route has to build as a directory
	// containing an index.html rather than a bare `<route>.html`.
	//
	// `build.format: 'directory'` is already Astro's default and is pinned here
	// only to keep it explicit; `trailingSlash` defaults to 'ignore', so it does
	// need setting. Astro's docs recommend pairing the two.
	//
	// Note that Astro emits `404.html` at the root regardless of this setting —
	// that is by design, and it is the file to hand to the Swarm manifest's
	// error-document on upload.
	trailingSlash: 'always',
	build: {
		format: 'directory',
	},

	i18n: {
		defaultLocale: DEFAULT_LOCALE,
		locales: [...LOCALES],
		routing: {
			// English lives at the site root, not /en/. Adding a second locale
			// later introduces /ko/ without moving any existing URL.
			prefixDefaultLocale: false,
		},
	},
});
