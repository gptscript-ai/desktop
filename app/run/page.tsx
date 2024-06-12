"use client"

import { useSearchParams } from 'next/navigation';
import Script from "@/components/script";

const Run = () => {
	const file = useSearchParams().get('file') || '';

	return (
		<div className="h-full w-full px-10 2xl:w-1/2 2xl:mx-auto 2xl:px-0 flex flex-col pb-10">
			<Script className="pb-10" file={file} />
		</div>
	);
};

export default Run;
