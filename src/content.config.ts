import { glob } from 'astro/loaders';
import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';

import { DEFAULT_LOCALE, LOCALES } from './i18n/config';

/**
 * Every collection carries `lang`, constrained to the locales declared in
 * `src/i18n/config.ts`. English is the only entry today; adding another there
 * makes these schemas accept it without a refactor here.
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
	schema: z.object({
		title: z.string(),
		/** One line, used on cards and as the section standfirst. */
		summary: z.string(),
		/** Emoji or short glyph carried over from the Notion database. */
		icon: z.string().optional(),
		...dateRange,
		/** Technologies. Also the source for the stack filter's options. */
		stacks: z.array(z.string()).min(1),
		scale: z.enum(['Small', 'Medium', 'Big']),
		/** Surfaced in "Selected work" on the home page. */
		featured: z.boolean().default(false),
		/** Live product, demo, or repo, where one is public. */
		productLink: z.url().optional(),
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
		date: z.coerce.date(),
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
