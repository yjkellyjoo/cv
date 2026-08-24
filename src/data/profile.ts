/**
 * Standing personal details — the parts of the CV that aren't page-like and so
 * don't warrant a content collection: contact, languages, skills, socials.
 *
 * Everything dated or narrative (roles, education, research, projects) lives in
 * `src/content/` instead, where it gets schema validation and can be sorted and
 * filtered at build time.
 */

export interface SpokenLanguage {
	name: string;
	/** Flag emoji, kept inline rather than as an image request. */
	flag: string;
	proficiency: 'native' | 'professional' | 'conversational';
}

export interface ToolGroup {
	group: string;
	items: string[];
}

export interface Social {
	label: string;
	handle: string;
	url: string;
}

export const profile = {
	name: 'Yejin Kelly Joo',
	title: 'Web3 Engineer',

	/** Used as the default meta description, so it stands alone out of context. */
	tagline:
		'Web3 engineer and developer advocate building blockchain infrastructure, APIs, and the documentation that makes them usable.',

	location: 'Remote — APAC | Seoul, South Korea',
	email: 'yejinkellyjoo@gmail.com',
	website: 'https://yjkellyjoo.dev',

	/**
	 * The lede. Condensed from the Notion summary; revisit during M2's editorial
	 * pass alongside the rest of the copy.
	 */
	summary: [
		'Trilingual Web3 professional with 4+ years across blockchain engineering and hands-on developer relations. I design robust API services, automate blockchain asset management, and lead technical teams in fast-moving environments.',
		'I also translate protocol-level technology into documentation, live demos, and hackathon programmes that drive real builder adoption — making sure advanced tech ships with tutorials and working code, not just a whitepaper.',
	],

	languages: {
		spoken: [
			{ name: 'Korean', flag: '🇰🇷', proficiency: 'native' },
			{ name: 'English', flag: '🇺🇸', proficiency: 'professional' },
			{ name: 'French', flag: '🇫🇷', proficiency: 'conversational' },
		] satisfies SpokenLanguage[],

		programming: ['Python', 'Kotlin', 'Java', 'TypeScript'],
	},

	/** The headline five, for the hero. The full breakdown is `toolchain`. */
	skills: ['Web3', 'Spring Framework', 'FastAPI', 'MySQL', 'MongoDB'],

	/**
	 * Grouped tooling, ported from the export's "Tools & Skills" section. Kept
	 * here rather than derived from the `projects` collection, because plenty of
	 * it (AWS, JIRA, Confluence, OAS3) never appears as a project tag.
	 */
	toolchain: [
		{
			group: 'Backend',
			items: ['Spring Cloud Gateway', 'Spring Boot', 'flask-RESTX', 'FastAPI', 'uvicorn', 'AWS', 'GCP', 'OAS3'],
		},
		{
			group: 'Database',
			items: ['MySQL', 'MariaDB', 'PyMySQL', 'SQLAlchemy', 'MyBatis', 'MongoDB'],
		},
		{
			group: 'Blockchain',
			items: ['web3.py', 'JSON-RPC API interaction'],
		},
		{
			group: 'Security',
			items: ['White-box testing', 'Vulnerable code clone detection', 'Smart contract vulnerability'],
		},
		{
			group: 'Other',
			items: ['Linux (Ubuntu)', 'Git / GitHub', 'Confluence', 'JIRA', 'Sentry', 'ReadMe'],
		},
	] satisfies ToolGroup[],

	/** Tools whose own site is worth linking, where the export linked them. */
	toolLinks: {
		Sentry: 'https://sentry.io/welcome/',
		ReadMe: 'https://readme.com/',
	} as Record<string, string>,

	socials: [
		{ label: 'GitHub', handle: 'yjkellyjoo', url: 'https://github.com/yjkellyjoo' },
		{
			label: 'LinkedIn',
			handle: 'yejinkellyjoo',
			url: 'https://www.linkedin.com/in/yejinkellyjoo/',
		},
	] satisfies Social[],
} as const;
