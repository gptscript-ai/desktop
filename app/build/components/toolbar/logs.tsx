import React, { useContext } from 'react';
import { BuildContext } from '@/app/build/page';
import { RunEventType } from '@gptscript-ai/gptscript';

const Logs = () => {
    const { logs } = useContext(BuildContext);

    return (
        <div className="max-h-full overflow-scroll p-4 rounded-2xl border-2 shadow-lg border-primary border-lg bg-black text-white">
            <ul>
                {logs.map((log, i) => (
                    <li key={i}>{JSON.stringify(log)}</li>
                ))}
            </ul>
        </div>
    );
};

export default Logs;