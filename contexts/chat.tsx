import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import useChatSocket from '@/components/chat/useChatSocket';
import { Message } from '@/components/chat/messages';
import { Block, Tool, Program } from '@gptscript-ai/gptscript';
import { Socket } from 'socket.io-client';
import { getThreads, getThread, Thread, createThread } from '@/actions/threads';
import { getScript, getScriptContent } from '@/actions/me/scripts';
import { loadTools, parseContent, rootTool } from '@/actions/gptscript';
import debounce from 'lodash/debounce';
import { setWorkspaceDir } from '@/actions/workspace';
import { gatewayTool } from '@/actions/knowledge/util';
import { tildy } from '@/config/assistant';

interface ChatContextProps {
  children: React.ReactNode;
  initialScript: string;
  initialSubTool?: string;
  initialScriptId?: string;
  enableThread?: boolean;
}

interface ChatContextState {
  script: string;
  scriptId?: string;
  scriptDisplayName?: string;
  setScriptId: React.Dispatch<React.SetStateAction<string | undefined>>;
  scriptContent: Block[];
  workspace: string;
  tools: string[];
  setTools: React.Dispatch<React.SetStateAction<string[]>>;
  setWorkspace: React.Dispatch<React.SetStateAction<string>>;
  subTool: string;
  setSubTool: React.Dispatch<React.SetStateAction<string>>;
  setScript: React.Dispatch<React.SetStateAction<string>>;
  setScriptContent: React.Dispatch<React.SetStateAction<Block[]>>;
  program: Program | null;
  showForm: boolean;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
  formValues: Record<string, string>;
  setFormValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
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
  setThread: React.Dispatch<React.SetStateAction<string>>;
  threads: Thread[];
  setThreads: React.Dispatch<React.SetStateAction<Thread[]>>;
  selectedThreadId: string | null;
  setSelectedThreadId: React.Dispatch<React.SetStateAction<string | null>>;
  socket: Socket | null;
  handleCreateThread: (script: string, id?: string) => void;
  connected: boolean;
  running: boolean;
  generating: boolean;
  error: string | null;
  setShouldRestart: React.Dispatch<React.SetStateAction<boolean>>;

  restart: () => void;
  interrupt: () => void;
  fetchThreads: () => void;
  restartScript: () => void;
}

const defaultScriptName = `Tildy`;

const ChatContext = createContext<ChatContextState>({} as ChatContextState);
const ChatContextProvider: React.FC<ChatContextProps> = ({
  children,
  initialScript,
  initialSubTool,
  initialScriptId,
  enableThread,
}) => {
  const [script, setScript] = useState<string>(initialScript);
  const [workspace, setWorkspace] = useState<string>('');
  const [tool, setTool] = useState<Tool>({} as Tool);
  const [program, setProgram] = useState<Program>({} as Program);
  const [showForm, setShowForm] = useState(true);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [scriptId, setScriptId] = useState<string | undefined>(initialScriptId);
  const [hasRun, setHasRun] = useState(false);
  const [hasParams, setHasParams] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [thread, setThread] = useState<string>('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [initialFetch, setInitialFetch] = useState(false);
  const [subTool, setSubTool] = useState(initialSubTool || '');
  const {
    socket,
    connected,
    running,
    messages,
    setMessages,
    restart,
    interrupt,
    generating,
    error,
    setRunning,
    tools,
    setTools,
    scriptContent,
    setScriptContent,
    forceRun,
    setForceRun,
  } = useChatSocket(isEmpty);
  const [scriptDisplayName, setScriptDisplayName] = useState<string>('');
  const threadInitialized = useRef(false);
  const [shouldRestart, setShouldRestart] = useState(false);

  useEffect(() => {
    if (!thread || scriptContent.length === 0) return;

    rootTool(scriptContent).then((tool) => {
      setTool(tool);
    });

    loadTools(scriptContent?.filter((block) => block.type === 'tool'))
      .then((program) => {
        setProgram(program);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [scriptContent]);

  useEffect(() => {
    if (scriptId) {
      getScript(scriptId).then(async (script) => {
        if (script === undefined) {
          setNotFound(true);
          return;
        }
        setNotFound(false);
        setScriptContent(script.script as Block[]);
        setScriptDisplayName(script.displayName || '');
        setInitialFetch(true);
      });
    } else if (script) {
      getScriptContent(script).then((content) => {
        if (content === undefined) {
          setNotFound(true);
          return;
        }
        setScriptDisplayName(defaultScriptName);
        parseContent(content).then((parsedContent) => {
          setScriptContent(parsedContent);
        });
        setNotFound(false);
        setInitialFetch(true);
      });
    }
  }, [script, scriptId, thread]);

  useEffect(() => {
    if (!enableThread || thread || threadInitialized.current) {
      return;
    }
    threadInitialized.current = true;
    const createAndSetThread = async () => {
      try {
        const threads = await getThreads();
        setThreads(threads);
        if ((initialScript && initialScriptId) || threads.length === 0) {
          // if both threads and scriptId are set, then always create a new thread
          const newThread = await createThread(
            script ? script : tildy,
            scriptDisplayName,
            scriptId
          );
          setThreads((threads) => [newThread, ...threads]);
          const threadId = newThread?.meta?.id;
          setThread(threadId);
          setScript(newThread.meta.script);
          setScriptId(newThread.meta.scriptId);
          setSelectedThreadId(threadId);
          setWorkspace(newThread.meta.workspace);
        } else if (threads.length > 0) {
          const latestThread = threads[0];
          setThread(latestThread.meta.id);
          setSelectedThreadId(latestThread.meta.id);
          setScriptId(latestThread.meta.scriptId);
          setScript(latestThread.meta.script);
          setWorkspace(latestThread.meta.workspace);
        }
      } catch (e) {
        threadInitialized.current = false;
        console.error(e);
      }
    };
    createAndSetThread();
  }, [thread, threads, enableThread, scriptDisplayName]);

  useEffect(() => {
    setHasParams(
      tool.arguments?.properties != undefined &&
        Object.keys(tool.arguments?.properties).length > 0
    );
  }, [tool]);

  useEffect(() => {
    if (thread && shouldRestart) {
      getThread(thread).then((thread) => {
        if (thread) {
          setInitialFetch(false);
          setWorkspace(thread.meta.workspace);
        }
        restartScript();
      });
    }
  }, [thread, shouldRestart]);

  useEffect(() => {
    if (hasRun) restartScript();
  }, [subTool]);

  useEffect(() => {
    setIsEmpty(!tool.instructions);
    if (
      hasRun ||
      !socket ||
      !connected ||
      !initialFetch ||
      (enableThread && !threadInitialized.current)
    )
      return;
    socket.emit(
      'run',
      scriptContent ? scriptContent : script,
      subTool ? subTool : tool.name,
      formValues,
      workspace,
      thread,
      gatewayTool()
    );
    setHasRun(true);
  }, [tool, connected, script, scriptContent, formValues, workspace, hasRun]);

  useEffect(() => {
    if (forceRun && socket && connected) {
      socket.emit(
        'run',
        scriptContent ? scriptContent : script,
        subTool ? subTool : tool.name,
        formValues,
        workspace,
        thread,
        gatewayTool()
      );
      setForceRun(false);
    }
  }, [
    forceRun,
    script,
    scriptContent,
    subTool,
    formValues,
    workspace,
    thread,
    connected,
  ]);

  useEffect(() => {
    const smallBody = document.getElementById('small-message');
    if (smallBody) smallBody.scrollTop = smallBody.scrollHeight;
  }, [messages, connected, running]);

  const fetchThreads = async () => {
    const threads = await getThreads();
    setThreads(threads);
  };

  const restartScript = useCallback(
    // This is debounced as allowing the user to spam the restart button can cause race
    // conditions. In particular, the restart may not be processed correctly and can
    // get the user into a state where no run has been sent to the server.
    debounce(async () => {
      // Here we specifically update Thread with selectedThreadId so that when it restarts it restarts with the specific thread.
      // We don't set thread directly after creating because it will re-render the page once thread is created on the fly
      if (selectedThreadId) {
        setThread(selectedThreadId);
      }
      setRunning(false);
      setHasRun(false);
      setInitialFetch(false);

      if (scriptId) {
        getScript(scriptId).then(async (script) => {
          if (script === undefined) {
            setNotFound(true);
            return;
          }
          setNotFound(false);
          setScriptContent(script.script as Block[]);
          setInitialFetch(true);
        });
      } else {
        getScriptContent(script).then(async (content) => {
          if (content === undefined) {
            setNotFound(true);
            return;
          }
          setScriptContent(await parseContent(content));
          setNotFound(false);
          setInitialFetch(true);
        });
      }
      restart();
    }, 200),
    [script, thread, restart, selectedThreadId]
  );

  const handleCreateThread = (script: string, id?: string) => {
    createThread(script, '', id).then((newThread) => {
      setScriptId(id);
      setThreads((threads: Thread[]) => [newThread, ...threads]);
      setScript(script);
      setThread(newThread.meta.id);
      setShouldRestart(true);
      setSelectedThreadId(newThread.meta.id);
      setWorkspaceDir(newThread.meta.workspace);
    });
  };

  return (
    <ChatContext.Provider
      value={{
        scriptContent,
        scriptDisplayName,
        scriptId,
        setScriptId,
        script,
        setScript,
        setScriptContent,
        workspace,
        setWorkspace,
        program,
        subTool,
        setSubTool,
        showForm,
        setShowForm,
        formValues,
        setFormValues,
        hasRun,
        setHasRun,
        hasParams,
        setHasParams,
        isEmpty,
        setIsEmpty,
        notFound,
        setNotFound,
        messages,
        setMessages,
        thread,
        setThread,
        threads,
        setThreads,
        selectedThreadId,
        setSelectedThreadId,
        socket,
        connected,
        running,
        generating,
        error,
        restart,
        interrupt,
        fetchThreads,
        restartScript,
        setShouldRestart,
        tools,
        setTools,
        handleCreateThread,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext, ChatContextProvider };
