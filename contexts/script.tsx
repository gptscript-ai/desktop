import { createContext, useState, useRef, useEffect, useCallback } from 'react';
import useChatSocket from '@/components/script/useChatSocket'
import { Message } from '@/components/script/messages';
import { Tool } from '@gptscript-ai/gptscript';
import { Socket } from 'socket.io-client';
import { Thread } from '@/actions/threads';
import {fetchScript, path} from "@/actions/scripts/fetch";
import { getThreads, getThread } from '@/actions/threads';
import debounce from 'lodash/debounce';
import { getWorkspaceDir } from '@/actions/workspace';

interface ScriptContextProps{
    children: React.ReactNode
    initialScript: string
    initialThread: string
}

interface ScriptContextState {
    script: string;
    workspace: string;
    setWorkspace: React.Dispatch<React.SetStateAction<string>>;
    setScript: React.Dispatch<React.SetStateAction<string>>;
    tool: Tool;
    setTool: React.Dispatch<React.SetStateAction<Tool>>;
    showForm: boolean;
    setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
    formValues: Record<string, string>;
    setFormValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    inputRef: React.RefObject<HTMLInputElement>;
    hasRun: boolean;
    setHasRun: React.Dispatch<React.SetStateAction<boolean>>;
    hasParams: boolean;
    setHasParams: React.Dispatch<React.SetStateAction<boolean>>;
    isEmpty: boolean;
    setIsEmpty: React.Dispatch<React.SetStateAction<boolean>>;
    notFound: boolean;
    setNotFound: React.Dispatch<React.SetStateAction<boolean>>;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    thread: string;
    setThread:React.Dispatch<React.SetStateAction<string>>;
    threads: Thread[];
    setThreads: React.Dispatch<React.SetStateAction<Thread[]>>;
    selectedThreadId: string | null;
    setSelectedThreadId: React.Dispatch<React.SetStateAction<string | null>>;
    socket: Socket | null;
    connected: boolean;
    running: boolean;
    generating: boolean;
    error: string | null;

    restart: () => void;
    interrupt: () => void;
    fetchThreads: () => void;
    restartScript: () => void;
}

const ScriptContext = createContext<ScriptContextState>({} as ScriptContextState);
const ScriptContextProvider: React.FC<ScriptContextProps> = ({children, initialScript, initialThread}) => {
    const [script, setScript] = useState<string>(initialScript);
    const [workspace, setWorkspace] = useState('');
    const [tool, setTool] = useState<Tool>({} as Tool);
	const [showForm, setShowForm] = useState(true);
	const [formValues, setFormValues] = useState<Record<string, string>>({});
	const inputRef = useRef<HTMLInputElement>(null);
	const [hasRun, setHasRun] = useState(false);
	const [hasParams, setHasParams] = useState(false);
    const [isEmpty, setIsEmpty] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [thread, setThread] = useState<string>(initialThread);
    const [threads, setThreads] = useState<Thread[]>([]);
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    const [initialFetch, setInitialFetch] = useState(false);
    const { 
        socket, connected, running, messages, setMessages, restart, interrupt, generating, error
    } = useChatSocket(isEmpty);

    // need to initialize the workspace from the env variable with serves
    // as the default.
    useEffect(() => {
        fetchThreads();
        getWorkspaceDir().then((workspace) => {
            setWorkspace(workspace);
        });
    }, [])

    useEffect(() => {
        fetchScript(script)
            .then((data) => {
                setTool(data);
                setInitialFetch(true);
            });
    }, [script]);

    useEffect(() => {
        setHasParams(tool.arguments?.properties != undefined && Object.keys(tool.arguments?.properties).length > 0);
        setIsEmpty(!tool.instructions);
    }, [tool]);

    useEffect(() => {
        if(thread) {
            getThread(thread)
                .then((thread) => {
                    if(thread) setWorkspace(thread.meta.workspace);
                });
            restartScript();
        }
    }, [thread]);

    useEffect(() => {
        if (hasRun || !socket || !connected) return;
        if (!tool.arguments?.properties || Object.keys(tool.arguments.properties).length === 0) {
            path(script)
                .then((path) => {
                    socket.emit("run", path, tool.name, formValues, workspace, thread)
                });
            setHasRun(true);
        }
    }, [tool, connected, script, formValues, thread, workspace]);

	useEffect(() => {
		const smallBody = document.getElementById("small-message");
		if (smallBody) smallBody.scrollTop = smallBody.scrollHeight;
	}, [messages, connected, running]);

    const fetchThreads = async () => {
        if (!setThreads) return;
        const threads = await getThreads();
        setThreads(threads);
    };

    const restartScript = useCallback(
        // This is debonced as allowing the user to spam the restart button can cause race
        // conditions. In particular, the restart may not be processed correctly and can
        // get the user into a state where no run has been sent to the server.
        debounce(async () => {
            setTool(await fetchScript(script));
            restart();
            setHasRun(false);
        }, 200),
    [script, restart]);

    return (
        <ScriptContext.Provider 
            value={{
                script, setScript,
                workspace, setWorkspace,
                tool, setTool,
                showForm, setShowForm,
                formValues, setFormValues,
                inputRef,
                hasRun, setHasRun,
                hasParams, setHasParams,
                isEmpty, setIsEmpty,
                notFound, setNotFound,
                messages, setMessages,
                thread, setThread,
                threads, setThreads,
                selectedThreadId, setSelectedThreadId,
                socket,
                connected,
                running,
                generating,
                error,
                restart,
                interrupt,
                fetchThreads,
                restartScript,
            }}
        >
            {children}
        </ScriptContext.Provider>
    );
};

export { ScriptContext, ScriptContextProvider };