"use client"

import { useSearchParams } from 'next/navigation';
import Script from "@/components/script";
import Threads from "@/components/threads";

const Run = () => {
	const file = useSearchParams().get('file') || '';

	return (
        <div className="w-full h-full flex pb-10">
            <Threads className="w-1/5"/>
			<Script className="pb-10 px-10" file={file} />
        </div>
		// <div className="h-full w-full px-10 2xl:w-1/2 2xl:mx-auto 2xl:px-0 flex flex-col pb-10">
        //     <Threads />
		// </div>
	);
};

export default Run;
