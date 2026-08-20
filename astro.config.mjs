// @ts-check
import { defineConfig } from 'astro/config';

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
	trailingSlash: 'always',
	build: {
		format: 'directory',
	},
});
