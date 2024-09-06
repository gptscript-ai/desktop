import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import useChatSocket from '@/components/chat/useChatSocket';
import { Message } from '@/components/chat/messages';
import { Block, Program, Tool, ToolDef } from '@gptscript-ai/gptscript';
import { Socket } from 'socket.io-client';
import { createThread, getThread, getThreads, Thread } from '@/actions/threads';
import { getScript, getScriptContent } from '@/actions/me/scripts';
import { loadTools, parseContent, rootTool } from '@/actions/gptscript';
import debounce from 'lodash/debounce';
import { setWorkspaceDir } from '@/actions/workspace';
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
  notFound: boolean;
  setNotFound: React.Dispatch<React.SetStateAction<boolean>>;
  latestAgentMessage: Message;
  setLatestAgentMessage: React.Dispatch<React.SetStateAction<Message>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  thread: string;
  setThread: React.Dispatch<React.SetStateAction<string>>;
  threads: Thread[];
  setThreads: React.Dispatch<React.SetStateAction<Thread[]>>;
  socket: Socket | null;
  handleCreateThread: (script: string, id?: string) => void;
  connected: boolean;
  running: boolean;
  generating: boolean;
  error: string | null;
  setShouldRestart: React.Dispatch<React.SetStateAction<boolean>>;
  waitingForUserResponse: boolean;

  restart: () => void;
  interrupt: () => void;
  fetchThreads: () => void;
  restartScript: () => void;
  switchToThread: (
    script: string,
    id: string,
    scriptId: string
  ) => Promise<void>;
}

const defaultScriptName = `Tildy`;
const notFoundScriptName = `[Assistant Not Found]`;

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
  const [notFound, setNotFound] = useState(false);
  const [thread, setThread] = useState<string>('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [initialFetch, setInitialFetch] = useState(false);
  const [subTool, setSubTool] = useState(initialSubTool || '');
  const {
    socket,
    connected,
    running,
    latestAgentMessage,
    setLatestAgentMessage,
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
    waitingForUserResponse,
  } = useChatSocket();
  const [scriptDisplayName, setScriptDisplayName] = useState<string>('');
  const threadInitialized = useRef(false);
  const [shouldRestart, setShouldRestart] = useState(false);

  const switchToThread = async (
    script: string,
    id: string,
    scriptId: string
  ) => {
    if (id !== thread) {
      setScript(script);
      setThread(id);
      setScriptContent((await getScript(scriptId))?.script || []);
      setScriptId(scriptId);
      setForceRun(true);
      setShouldRestart(true);
    }
  };

  useEffect(() => {
    if (!thread || scriptContent.length === 0) return;

    rootTool(scriptContent).then((tool) => {
      setTool(tool);
    });

    loadTools(
      scriptContent
        ?.filter((block) => block.type !== 'text')
        .map((b) => b as ToolDef)
    )
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
          setScriptContent([]);
          setScriptDisplayName(notFoundScriptName);
        } else {
          setNotFound(false);
          setScriptContent(script.script as Block[]);
          setScriptDisplayName(script.displayName || '');
        }
        setInitialFetch(true);
      });
    } else if (script) {
      getScriptContent(script).then((content) => {
        if (content === undefined) {
          setNotFound(true);
          setScriptContent([]);
          setScriptDisplayName(notFoundScriptName);
        } else {
          parseContent(content).then((parsedContent) => {
            setScriptContent(parsedContent);
          });
          setNotFound(false);
          setScriptDisplayName(defaultScriptName);
        }
        setInitialFetch(true);
      });
    }
  }, [script, scriptId, setScriptContent, thread]);

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
          setWorkspace(newThread.meta.workspace);
        } else if (threads.length > 0) {
          const latestThread = threads[0];
          setThread(latestThread.meta.id);
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
      getThread(thread).then(async (thread) => {
        if (thread) {
          setInitialFetch(false);
          setWorkspace(thread.meta.workspace);
        }
        // need to wait for the WS Server to restart befgore triggering another event
        await restartScript();
        setShouldRestart(false);
      });
    }
  }, [thread, shouldRestart]);

  useEffect(() => {
    if (hasRun) restartScript();
  }, [subTool]);

  useEffect(() => {
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
      scriptId
    );
    setHasRun(true);
  }, [tool, connected, script, scriptContent, formValues, workspace, hasRun]);

  useEffect(() => {
    if (forceRun && socket && connected) {
      interrupt();
      socket.emit(
        'run',
        scriptContent ? scriptContent : script,
        subTool ? subTool : tool.name,
        formValues,
        workspace,
        thread,
        scriptId
      );
      setForceRun(false);
    }
  }, [
    tool,
    scriptId,
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
      if (thread) {
        setThread(thread);
      }
      setRunning(false);
      setHasRun(false);
      setInitialFetch(false);

      if (scriptId) {
        const foundScript = await getScript(scriptId);

        if (!foundScript) {
          setNotFound(true);
          setScriptContent([]);
          setScriptDisplayName(notFoundScriptName);
          return;
        }

        setNotFound(false);
        setScriptContent(foundScript.script as Block[]);
        setInitialFetch(true);
      } else {
        const content = await getScriptContent(script);

        if (!content) {
          setNotFound(true);
          setScriptContent([]);
          setScriptDisplayName(notFoundScriptName);
          return;
        }

        setScriptContent(await parseContent(content));
        setNotFound(false);
        setInitialFetch(true);
      }
      restart();
    }, 200),
    [script, thread, restart, interrupt, scriptId]
  );

  const handleCreateThread = (script: string, id?: string) => {
    createThread(script, '', id).then((newThread) => {
      setTools([]);
      setScriptId(id);
      setThreads((threads: Thread[]) => [newThread, ...threads]);
      setScript(script);
      setThread(newThread.meta.id);
      setShouldRestart(true);
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
        notFound,
        setNotFound,
        latestAgentMessage,
        setLatestAgentMessage,
        messages,
        setMessages,
        thread,
        setThread,
        threads,
        setThreads,
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
        waitingForUserResponse,
        tools,
        setTools,
        handleCreateThread,
        switchToThread,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext, ChatContextProvider };
