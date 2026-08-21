/**
 * Build the site, then assert the invariants `astro build` won't fail on itself.
 *
 * Two gaps this closes:
 *
 * 1. A dangling `reference()` in a content collection logs `[ERROR] Invalid
 *    content reference` but still exits 0, so a broken link between, say, an
 *    award and its project would pass CI unnoticed.
 * 2. Swarm serves this site from a manifest with `index-document: index.html`,
 *    so every route must build as `<route>/index.html`. A stray `<route>.html`
 *    works on Cloudflare Pages and 404s on Swarm — the worst kind of bug to
 *    find late. Astro's root `404.html` is the one legitimate exception, and is
 *    what the manifest's error-document points at.
 */
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const ALLOWED_NON_INDEX_HTML = new Set(['404.html']);

/**
 * Astro logs these at error level but still exits 0. `[ERROR]` alone covers the
 * dangling-reference case, since the logger prefixes it on the same line — the
 * pattern is kept broad deliberately, to catch siblings we have not hit yet.
 */
const SILENT_ERROR_PATTERNS = [/\[ERROR\]/];

const build = spawnSync('npx', ['astro', 'build'], {
	encoding: 'utf8',
	stdio: ['ignore', 'pipe', 'pipe'],
});

const output = `${build.stdout ?? ''}${build.stderr ?? ''}`;
process.stdout.write(output);

const failures = [];

if (build.status !== 0) {
	failures.push(`astro build exited with code ${build.status}`);
}

// Only meaningful when the build claimed success; on a real failure the exit
// code already says so, and these lines would just restate it as a false
// "without failing".
if (build.status === 0) {
	const offendingLines = new Set(
		output
			.split('\n')
			.filter((line) => SILENT_ERROR_PATTERNS.some((pattern) => pattern.test(line)))
			.map((line) => line.trim()),
	);

	for (const line of offendingLines) {
		failures.push(`build logged an error without failing: ${line}`);
	}
}

/** Every .html file under dist, relative to dist. */
function htmlFiles(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return htmlFiles(path);
		return entry.name.endsWith('.html') ? [relative(DIST, path)] : [];
	});
}

if (build.status === 0) {
	const stray = htmlFiles(DIST).filter(
		(file) => !file.endsWith('index.html') && !ALLOWED_NON_INDEX_HTML.has(file),
	);

	if (stray.length > 0) {
		failures.push(
			`not built as <route>/index.html, so these would 404 on Swarm:\n    ${stray.join('\n    ')}`,
		);
	}
}

if (failures.length > 0) {
	console.error(`\n✗ verify-build failed:\n${failures.map((f) => `  - ${f}`).join('\n')}\n`);
	process.exit(1);
}

console.log('\n✓ verify-build: no silent errors, every route is a directory index\n');
