import { z } from 'astro/zod';

/**
 * Minimal "[text](url)" link parsing for plain-string schema fields that
 * occasionally carry a single Markdown link — `experience.blurb` on
 * `pilab.md` is the one instance today: 'a [Bitcoin banking service]
 * (https://www.btcfi.one/)' inside an otherwise plain sentence.
 *
 * This is not a Markdown renderer — no bold, italic, or code support, just
 * the one pattern that shows up in that field — so a full body goes through
 * the content collection's own renderer instead (`render()` from
 * `astro:content`). Every blurb, linked or not, comes back as a uniform list
 * of segments, so a caller can `.map()` every one the same way without a
 * branch for "does this blurb happen to contain a link".
 *
 * No `set:html` involved: segments are plain text and an optional href,
 * rendered as ordinary Astro template nodes.
 *
 * The destination group allows one level of balanced parentheses —
 * `(?:[^()\s]|\([^()\s]*\))*` — because CommonMark permits them in a link
 * destination and `https://en.wikipedia.org/wiki/Foo_(bar)`-shaped URLs are
 * a real, unremarkable shape. A naive `[^)]+` stops at the first `)`,
 * truncating that URL to `…Foo_(bar`. Two levels of nesting (e.g.
 * `(a(b(c))d)`) don't match the pattern at all, so the whole `[label](…)`
 * falls through unmatched and renders as literal Markdown text on the page
 * — silently, not a truncated href. That's beyond what this content needs,
 * and reaching further means a real parser, which this repository has
 * already deleted once at four times the size — the boundary here is
 * deliberate, not an oversight, but it fails open (inert text) rather than
 * loud, so it's worth knowing about.
 *
 * Every extracted URL is also run through `z.url({ protocol: /^https$/i })`
 * — restricted to `https`, unlike the bare `z.url()` every other
 * link-bearing field in `src/content.config.ts` uses, because those fields
 * take a whole URL from frontmatter while this one extracts a URL out of
 * the *middle* of a string a build author typed by hand, an easier place
 * for `javascript:` or `data:` to land unnoticed. Every URL in the content
 * today is `https`; `http` is refused too since nothing currently needs it
 * and there's no reason to admit an unencrypted scheme this module didn't
 * already carry. A destination that fails this check throws, naming the
 * offending link text and URL, rather than reaching `href` unvalidated.
 * This guard is distinct from the regex above and neither stands in for
 * the other: the regex keeps a well-formed destination from being cut
 * short (a shape failure); `z.url({ protocol })` rejects a destination
 * that parses fine but names a scheme this module refuses to hand to
 * `href` (a content failure) — it does not, and cannot, catch truncation,
 * since a truncated URL is still typically syntactically valid. Both
 * failures throw at build time over committed content, rather than
 * shipping a broken or unsafe href silently.
 */

export interface InlineSegment {
	text: string;
	url?: string;
}

const LINK_PATTERN = /\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))*)\)/g;

export function parseInlineLinks(text: string): InlineSegment[] {
	const segments: InlineSegment[] = [];
	let lastIndex = 0;

	for (const match of text.matchAll(LINK_PATTERN)) {
		const [full, label, url] = match;
		const index = match.index ?? 0;

		if (index > lastIndex) {
			segments.push({ text: text.slice(lastIndex, index) });
		}

		const result = z.url({ protocol: /^https$/i }).safeParse(url);
		if (!result.success) {
			throw new Error(`parseInlineLinks: invalid URL in link "[${label}](${url})"`);
		}

		segments.push({ text: label, url: result.data });
		lastIndex = index + full.length;
	}

	if (lastIndex < text.length) {
		segments.push({ text: text.slice(lastIndex) });
	}

	return segments;
}
