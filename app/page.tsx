import { Link } from "@nextui-org/link";
import { button as buttonStyles } from "@nextui-org/theme";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import Scripts from "@/components/scripts";

export default function Home() {
	return (
		<section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
			<div className="inline-block max-w-lg text-center justify-center">
				<h1 className={title()}>
					GPTScript Builder
				</h1>
				<h2 className={subtitle({ class: "mt-4" })}>
					Select a script below to run or edit. You can also create a new script from scratch.
				</h2>
			</div>

			<div className="w-3/4">
				<Scripts/>
			</div>
		</section>
	);
}
