export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: "GPTScript",
    description: "Run and build GPTSscripts.",
    navItems: [
        {
            label: "Home",
            href: "/",
        },
        {
			label: "Explore",
			href: "/explore",
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
			label: "Explore",
			href: "/explore",
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
