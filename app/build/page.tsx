"use client";

import {useContext, useEffect} from "react";
import {AuthContext} from "@/contexts/auth";
import {title, subtitle} from "@/components/primitives";
import Scripts from "@/components/scripts";
import Loading from "@/components/loading";
import { NavContext } from "@/contexts/nav";
import { GoPeople } from "react-icons/go";
import Create from "@/components/scripts/create";

export default function Home() {
    const {loading} = useContext(AuthContext);
    const {setCurrent} = useContext(NavContext);
    useEffect(() => setCurrent('/build'), [])
    if (loading) return <Loading/>;
    return (
        <section className="w-full gap-4 px-20 pt-20">
                <div className="flex justify-between">
                    <h1 className="text-4xl font-bold text-primary-400">
                        <GoPeople className="inline mb-2 mr-1 text-5xl"/> My Assistants
                    </h1>
                    <Create/>
                </div>

                <div className="w-full pt-16 pb-24">
                    <Scripts/>
                </div>
        </section>
    );
}