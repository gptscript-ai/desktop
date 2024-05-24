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
		{
			label: "Build",
			href: "/build",
		},

		{
			label: "About",
			href: "/about",
		}
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
		{
			label: "Build",
			href: "/build",
		},
		{
			label: "About",
			href: "/about",
		}
	],
	links: {
		github: "https://github.com/gptscript-ai/gptscript",
		twitter: "https://twitter.com/ibuildthecloud",
		discord: "https://discord.gg/eMrC4Uf8",
	},
};
