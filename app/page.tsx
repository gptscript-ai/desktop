import { title, subtitle } from "@/components/primitives";
import Scripts from "@/components/scripts";

export default function Home() {
	return (
		<section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
			<div className="inline-block max-w-lg text-center justify-center">
				<h1 className={title() + ' drop-shadow-xl'}>
					My Scripts
				</h1>
				<h2 className={subtitle({ class: "mt-4 mb-10" })}>
					Select a script below to run.
				</h2>
			</div>

			<div className="w-full">
				<Scripts buildOptions={process.env.BUILDER_UI === "true"}/>
			</div>
		</section>
	);
}
