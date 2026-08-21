/**
 * The single source of truth for locales.
 *
 * Imported by both `astro.config.ts` (to configure routing) and
 * `src/content.config.ts` (to constrain every collection's `lang` field), so the
 * two can never drift apart.
 *
 * Adding a locale is a one-line change here: append it to `LOCALES`, and the
 * content schemas start accepting it. English stays unprefixed at the site root
 * because `prefixDefaultLocale` is false, so `/ko/` would be additive rather
 * than a re-route of existing URLs.
 */
export const DEFAULT_LOCALE = 'en';

export const LOCALES = ['en'] as const;

export type Locale = (typeof LOCALES)[number];
