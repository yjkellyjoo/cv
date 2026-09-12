/**
 * Pure, dependency-free date formatting for the CV's content collections.
 *
 * Every date arrives as a `Date` object via `z.coerce.date()`, coerced from a
 * frontmatter string like `2024-07-12`, which parses as UTC midnight. All
 * formatting here reads a date's UTC fields rather than the host's local
 * time, so a build running in any timezone renders the same calendar date
 * that was written in the frontmatter.
 *
 * No date library — every kilobyte here is a paid-for Swarm chunk.
 */

const MONTH_YEAR_FORMAT = new Intl.DateTimeFormat('en', {
	month: 'short',
	year: 'numeric',
	timeZone: 'UTC',
});

/** "Jul 2024" — a single date as a month/year label. */
export function formatMonthYear(date: Date): string {
	return MONTH_YEAR_FORMAT.format(date);
}

/**
 * "Jul 2024 — Present" or "Jul 2024 — Aug 2025" — a start/end range.
 *
 * A missing `dateEnd` reads as "Present", matching the schema's convention
 * that an absent end date means the thing is still ongoing.
 */
export function formatDateRange(dateStart: Date, dateEnd?: Date): string {
	const end = dateEnd ? formatMonthYear(dateEnd) : 'Present';
	return `${formatMonthYear(dateStart)} — ${end}`;
}

/**
 * "10m." or "3y." — a short duration badge, in the plan's own shape, for the
 * experience timeline rail.
 *
 * A missing `dateEnd` measures against today. Durations under a year round to
 * the nearest whole month; a year or over rounds to the nearest whole year.
 * A same-month range floors to "1m." rather than "0m." so nothing ongoing
 * reads as having taken no time at all.
 */
export function formatDuration(dateStart: Date, dateEnd?: Date): string {
	const end = dateEnd ?? new Date();

	const totalMonths = Math.max(
		1,
		Math.round(monthsBetween(dateStart, end)),
	);

	if (totalMonths < 12) {
		return `${totalMonths}m.`;
	}
	return `${Math.round(totalMonths / 12)}y.`;
}

/** "2024-07-12" — the machine-readable form for a `<time datetime>` attribute. */
export function toDateAttr(date: Date): string {
	return date.toISOString().slice(0, 10);
}

/** Whole months between two dates, counting UTC calendar fields, fractional. */
function monthsBetween(start: Date, end: Date): number {
	const monthDiff =
		(end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
		(end.getUTCMonth() - start.getUTCMonth());
	const dayFraction = (end.getUTCDate() - start.getUTCDate()) / 30;
	return monthDiff + dayFraction;
}
