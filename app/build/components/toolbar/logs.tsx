import React from 'react';

interface Log {
    id: number;
    message: string;
    timestamp: string;
}

interface LogsProps {
    logs: Log[];
}

const Logs: React.FC<LogsProps> = ({ logs }) => {
    return (
        <div className="max-h-full overflow-y-scroll p-4 rounded-2xl border-2 shadow-lg border-primary border-lg bg-black text-white">
            <ul>
                {logs.map((log) => (
                    <li key={log.id}>
                        <span>{log.timestamp}: </span>
                        <span>{log.message}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Logs;