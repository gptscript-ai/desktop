"use client";

import {useContext, useEffect} from "react";
import {AuthContext} from "@/contexts/auth";
import {title, subtitle} from "@/components/primitives";
import Scripts from "@/components/scripts";
import Loading from "@/components/loading";
import { NavContext } from "@/contexts/nav";

export default function Home() {
    const {loading} = useContext(AuthContext);
    const {setCurrent} = useContext(NavContext);
    useEffect(() => setCurrent('/build'), [])
    if (loading) return <Loading/>;
    return (
        <section className="flex flex-col items-center w-full gap-4 py-8 md:py-10" style={{width: `100vw`, height: `calc(100vh - 60px)`}}>
                <div className="inline-block max-w-lg text-center justify-center pt-20">
                    <h1 className={title() + ' drop-shadow-xl'}>
                        My Assistants
                    </h1>
                    <h2 className={subtitle({class: "mt-4"})}>
                        Select an assistant below to interact with or edit.
                    </h2>
                </div>

                <div className="w-full 2xl:w-[70%] overflow-y-auto p-6 pt-16">
                    <Scripts/>
                </div>
        </section>
    );
}