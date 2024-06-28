export type SiteConfig = typeof siteConfig;

export const siteConfig = {
	name: "Chat Builder",
	description: "Quickly prototype your GPTSscript chat bots.",
	navItems: [
		{
			label: "Home",
			href: "/",
		},
		{
			label: "Docs",
			href: "https://docs.gptscript.ai",
			external: true,
		},

	],
	navMenuItems: [
		{
			label: "Home",
			href: "/",
		},
		{
			label: "Docs",
			href: "https://docs.gptscript.ai",
			external: true,
		},
	],
	links: {
		github: "https://github.com/gptscript-ai/gptscript",
		twitter: "https://x.com/GPTScript_ai",
		discord: "https://discord.gg/QrZbhy55",
	},
};
