/**
 * Build the site, then assert the invariants `astro build` won't fail on itself.
 *
 * Three gaps this closes:
 *
 * 1. A dangling `reference()` in a content collection logs `[ERROR] Invalid
 *    content reference` but still exits 0, so a broken link between, say, an
 *    award and its project would pass CI unnoticed.
 * 2. Swarm serves this site from a manifest with `index-document: index.html`,
 *    so every route must build as `<route>/index.html`. A stray `<route>.html`
 *    works on Cloudflare Pages and 404s on Swarm — the worst kind of bug to
 *    find late. Astro's root `404.html` is the one legitimate exception, and is
 *    what the manifest's error-document points at.
 * 3. `src/content/**\/*.md` is full of `../`-prefixed paths into `src/assets`,
 *    and none of them are checked today. A collection's schema itself runs at
 *    sync/build time regardless of whether anything calls `getCollection()` —
 *    a type error or the icon/logo `superRefine` fails the build either way.
 *    `image()` is narrower: it records a frontmatter `logo:` path when it
 *    parses the entry, but only resolves it — checks the file actually
 *    exists — once something reads that field. `src/pages/index.astro` is the
 *    only route in the project, and it reads from `src/data`, not from a
 *    content collection, so nothing reads it yet and a typo'd `logo:` builds
 *    clean today. A Markdown body image is unchecked for a different reason:
 *    schemas validate frontmatter, not prose, so `image()` never covers it at
 *    all. Both gaps close on their own once a page renders the collection —
 *    Astro fails the build with `[ImageNotFound]` on a missing frontmatter
 *    `logo:` just as it does on a missing body image — but this check keeps
 *    earning its place for body images even then, because it reports every
 *    broken reference across every content file in one pass, where a
 *    renderer stops at the first one it happens to touch. This check resolves
 *    every `../`-prefixed reference in every content file, frontmatter and
 *    body alike, against the file it appears in, so both kinds of typo are
 *    caught regardless of whether or when a page renders them.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const DIST = 'dist';
const ALLOWED_NON_INDEX_HTML = new Set(['404.html']);
const CONTENT_DIR = 'src/content';

/**
 * Matches a `../`-prefixed reference wherever it appears in a content file:
 * a frontmatter value (`logo: ../../assets/icons/foo.svg`) or a Markdown
 * body image (`![alt](../../assets/projects/foo/bar.png)`). Both shapes end
 * the path at the same set of characters — whitespace, or a closing paren,
 * quote, or bracket — so one pattern covers both without caring which shape
 * it is looking at.
 */
const RELATIVE_REFERENCE_PATTERN = /\.\.\/[^\s)"'\]]+/g;

/**
 * Not every `../` string in a content file is an asset reference. A link to a
 * sibling page — `[NVD crawler](../nvd-crawling-scheduler/)` — is the shape
 * that matters, because it is the natural way to cross-link once pages exist,
 * and resolving it against `src/assets` would fail the build over content that
 * is perfectly correct.
 *
 * The rule: a reference is worth checking if it ends at a file extension, or if
 * it points into an `assets/` directory. Both of this project's real shapes
 * satisfy it — a Markdown body image and a frontmatter `logo:` — and a page
 * link satisfies neither.
 *
 * This deliberately gives up one case: an extensionless reference outside an
 * `assets/` directory is skipped rather than checked. Nothing in the collection
 * is shaped that way, because every asset lives under `src/assets/`.
 */
const ASSET_EXTENSION_PATTERN = /\.[A-Za-z0-9]+$/;
const ASSET_PATH_SEGMENT_PATTERN = /(?:^|\/)assets\//;

function looksLikeAssetReference(reference) {
	return ASSET_EXTENSION_PATTERN.test(reference) || ASSET_PATH_SEGMENT_PATTERN.test(reference);
}

/**
 * Markdown decodes a percent-encoded destination before resolving it, so
 * `open%20run.png` names the file `open run.png`. The Notion export this
 * content was ported from writes its paths that way, so a later port can carry
 * one in. An invalid encoding is left as-is rather than throwing: the reference
 * then fails to resolve and gets reported, which is the honest outcome.
 */
function decodeReference(reference) {
	try {
		return decodeURIComponent(reference);
	} catch {
		return reference;
	}
}

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

/** Every .md file under a content collection directory, relative to the repo root. */
function markdownFiles(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return markdownFiles(path);
		return entry.name.endsWith('.md') ? [path] : [];
	});
}

// Independent of the build result: these are source files, not build output,
// so there is no reason to skip this check on a failed build.
{
	const brokenReferences = [];

	for (const file of markdownFiles(CONTENT_DIR)) {
		const text = readFileSync(file, 'utf8');
		const references = text.match(RELATIVE_REFERENCE_PATTERN) ?? [];

		for (const reference of references) {
			if (!looksLikeAssetReference(reference)) continue;

			const resolved = join(dirname(file), decodeReference(reference));
			if (!existsSync(resolved)) {
				brokenReferences.push(`${file}: ${reference}`);
			}
		}
	}

	if (brokenReferences.length > 0) {
		failures.push(
			`content references a file that does not exist:\n    ${brokenReferences.join('\n    ')}`,
		);
	}
}

if (failures.length > 0) {
	console.error(`\n✗ verify-build failed:\n${failures.map((f) => `  - ${f}`).join('\n')}\n`);
	process.exit(1);
}

console.log(
	'\n✓ verify-build: no silent errors, every route is a directory index, every content reference resolves\n',
);
