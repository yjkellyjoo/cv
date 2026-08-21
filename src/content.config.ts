import { glob } from 'astro/loaders';
import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';

import { DEFAULT_LOCALE, LOCALES } from './i18n/config';

/**
 * Every collection carries `lang`, constrained to the locales declared in
 * `src/i18n/config.ts`. English is the only entry today; adding another there
 * makes these schemas accept it without a refactor here.
 *
 * Note what this does *not* do. Entries are keyed by filename, not by locale, so
 * a second locale needs two further things at that point: a `generateId` on the
 * loader that strips the locale segment (otherwise `ko/pet-id.md` yields the id
 * `ko/pet-id`, and the anchor becomes `#ko/pet-id`), and a `translationKey` to
 * pair a translated entry with its original so `reference()` resolves within the
 * right locale. Both are deliberately deferred — building them for a locale that
 * does not exist yet would be speculative. English URLs are unaffected either
 * way, because `prefixDefaultLocale` is false.
 */
const lang = z.enum(LOCALES).default(DEFAULT_LOCALE);

/**
 * Markdown under `src/content/<name>/`. Entry `id` comes from the filename, and
 * is the stable anchor/slug — deliberately not a separate frontmatter field, so
 * there is one source of truth rather than two that can drift.
 */
const markdownIn = (name: string) =>
	glob({ base: `./src/content/${name}`, pattern: '**/*.md' });

/** Shared by anything with a start and an optional, still-running end. */
const dateRange = {
	dateStart: z.coerce.date(),
	/** Omit while ongoing — renderers treat a missing end as "present". */
	dateEnd: z.coerce.date().optional(),
};

const projects = defineCollection({
	loader: markdownIn('projects'),
	// Function form so the schema can use `image()`, which validates the file
	// exists at build time and hands the page an optimizable ImageMetadata
	// rather than a string that can rot.
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			/** One line, used on cards and as the section standfirst. */
			summary: z.string(),
			/**
			 * Emoji carried over from the Notion database. Projects with real
			 * artwork set `logo` instead — every project has exactly one of the two.
			 */
			icon: z.string().optional(),
			/** Project logo or key art, where one exists. */
			logo: image().optional(),
			...dateRange,
			/** Technologies. Also the source for the stack filter's options. */
			stacks: z.array(z.string()).min(1),
			scale: z.enum(['Small', 'Medium', 'Big']),
			/** Surfaced in "Selected work" on the home page. */
			featured: z.boolean().default(false),
			/**
			 * Outbound links, labelled because most projects have several of a
			 * different kind — demo, deck, source, showcase. 10 of the 15 Notion
			 * pages carry two or more, so a single `productLink` would lose them.
			 */
			links: z
				.array(
					z.object({
						label: z.string(),
						url: z.url(),
					}),
				)
				.default([]),
			lang,
		}),
});

const experience = defineCollection({
	loader: markdownIn('experience'),
	schema: z.object({
		role: z.string(),
		org: z.string(),
		orgUrl: z.url().optional(),
		...dateRange,
		/** One or two lines describing the employer or product context. */
		blurb: z.string(),
		stacks: z.array(z.string()).default([]),
		lang,
	}),
});

const education = defineCollection({
	loader: markdownIn('education'),
	schema: z.object({
		/** e.g. "M.S. Course", "B.A. Course". */
		qualification: z.string(),
		institution: z.string(),
		institutionUrl: z.url().optional(),
		/** Field or department. */
		field: z.string(),
		/** Free text, because the scales differ: "4.27/4.5", "Bac S 14/20". */
		grade: z.string().optional(),
		...dateRange,
		lang,
	}),
});

const research = defineCollection({
	loader: markdownIn('research'),
	schema: z.object({
		title: z.string(),
		/** Korean title, kept alongside the English as formally cited. */
		titleLocal: z.string().optional(),
		/** Funding body, e.g. "IITP", "ETRI NSR". */
		supportOrg: z.string(),
		role: z.string().default('Research participant'),
		...dateRange,
		/** The project page describing this work in detail. */
		project: reference('projects').optional(),
		lang,
	}),
});

const publications = defineCollection({
	loader: markdownIn('publications'),
	schema: z.object({
		title: z.string(),
		/** Conference or, for a thesis, the awarding context. */
		venue: z.string(),
		date: z.coerce.date(),
		/** e.g. "1st Author". */
		authorship: z.string(),
		/** Site-relative path (e.g. /thesis/prosmart.pdf), so not a full URL. */
		pdfUrl: z.string().optional(),
		demoUrl: z.url().optional(),
		project: reference('projects').optional(),
		lang,
	}),
});

const awards = defineCollection({
	loader: markdownIn('awards'),
	schema: z.object({
		/** The competition, e.g. "ETHGlobal Brussels 2024". */
		event: z.string(),
		/** The track or category placed in. */
		track: z.string().optional(),
		/** e.g. "1st Place", "Finalist". */
		placement: z.string(),
		/**
		 * Year only. The export dates awards no more precisely than this, and it
		 * is all that gets displayed — the exact day, where it matters, comes
		 * from the linked project.
		 */
		year: z.number().int(),
		project: reference('projects').optional(),
		lang,
	}),
});

export const collections = {
	projects,
	experience,
	education,
	research,
	publications,
	awards,
};
