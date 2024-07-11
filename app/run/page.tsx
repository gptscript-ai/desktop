"use client"

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Script from "@/components/script";
import Threads from "@/components/threads";

const Run = () => {
    const [file, setFile] = useState<string>(useSearchParams().get('file') || '');
    const [thread, setThread] = useState<string>(useSearchParams().get('thread') || '');

	return (
        <div className="w-full h-full flex pb-10">
            <Threads setThread={setThread} setScript={setFile} className=""/>
			<Script className="pb-10 w-[52%] mx-auto" file={file} thread={thread}/>
        </div>
	);
};

export default Run;
