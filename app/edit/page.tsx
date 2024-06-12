"use client"

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Script from "@/components/script";
import Configure from "@/components/edit/configure";
import { EditContextProvider } from "@/contexts/edit";
import New from "@/components/edit/new";
import ScriptNav from "@/components/edit/scriptNav";

export default function Edit() {
	const [file, setFile] = useState<string>(useSearchParams().get('file') || '');

	if (!file || file === 'new') return (
		<div className="w-full h-full flex items-center justify-center align-center">
			<div className="absolute left-2 top-2">
				<ScriptNav />
			</div>
			<New 
				className="w-1/2"
				setFile={setFile}
			/>
		</div>
	)

	return (
		<EditContextProvider file={file}>
			<div className="w-full h-full grid grid-cols-2">
				<div className="absolute left-2 top-2">
					<ScriptNav />
				</div>
				<div className="h-full overflow-auto w-full border-r-2 dark:border-zinc-800 p-6">
					<Configure file={file} />
				</div>
				<div className="overflow-auto w-full">
					<Script className="h-[92%]" file={file} />
				</div>
			</div>
		</EditContextProvider>
	);
}