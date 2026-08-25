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
 */

export interface InlineSegment {
	text: string;
	url?: string;
}

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

export function parseInlineLinks(text: string): InlineSegment[] {
	const segments: InlineSegment[] = [];
	let lastIndex = 0;

	for (const match of text.matchAll(LINK_PATTERN)) {
		const [full, label, url] = match;
		const index = match.index ?? 0;

		if (index > lastIndex) {
			segments.push({ text: text.slice(lastIndex, index) });
		}
		segments.push({ text: label, url });
		lastIndex = index + full.length;
	}

	if (lastIndex < text.length) {
		segments.push({ text: text.slice(lastIndex) });
	}

	return segments;
}
