import {title, subtitle} from "@/components/primitives";
import Scripts from "@/components/scripts";

export default function Home() {
    return (
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
            <div className="inline-block max-w-lg text-center justify-center">
                <h1 className={title() + ' drop-shadow-xl'}>
                    My Assistants
                </h1>
                <h2 className={subtitle({class: "mt-4 mb-10"})}>
                    Select an assistant below to interact with or edit.
                </h2>
            </div>

            <div className="w-full">
                <Scripts/>
            </div>
        </section>
    );
}
