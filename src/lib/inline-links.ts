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
 * truncating that URL to `…Foo_(bar`. Two levels of nesting still truncate
 * (`(a(b(c))d)` loses the innermost pair); that's beyond what this content
 * needs, and reaching further means a real parser, which this repository
 * has already deleted once at four times the size — the boundary here is
 * deliberate, not an oversight.
 *
 * Every extracted URL is also validated with `z.url()`, the same check
 * `src/content.config.ts` runs on every other link-bearing field, and
 * throws on failure, naming the offending link text and URL, rather than
 * reaching `href` unvalidated. This is a different guard from the regex
 * above and does not stand in for it: the regex keeps a destination from
 * being cut short, `z.url()` catches a destination that's malformed
 * outright (e.g. a broken scheme) — it does not, and cannot, catch
 * truncation, since a truncated URL is still typically syntactically valid.
 * Both run at build time over committed content, so either failure mode
 * fails the build loudly instead of shipping a broken href.
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

		const result = z.url().safeParse(url);
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
