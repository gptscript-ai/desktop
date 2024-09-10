import { getToolDisplayName, parseBlock } from '@/actions/gptscript';
import { ingest } from '@/actions/knowledge/knowledge';
import { gatewayTool, getCookie } from '@/actions/knowledge/util';
import { uploadFile } from '@/actions/upload';
import Upload from '@/components/chat/chatBar/upload';
import { MessageType } from '@/components/chat/messages';
import { ToolActionChatMessage } from '@/components/shared/tools/ToolActionChatMessage';
import { UrlToolModal } from '@/components/shared/tools/UrlToolModal';
import { ChatContext } from '@/contexts/chat';
import { useAsync } from '@/hooks/useFetch';
import { Card, Listbox, ListboxItem, useDisclosure } from '@nextui-org/react';
import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  GoAlert,
  GoCheckCircleFill,
  GoGlobe,
  GoInbox,
  GoIssueReopened,
  GoPaperclip,
  GoTools,
} from 'react-icons/go';
import { PiToolbox } from 'react-icons/pi';
import { useFilePicker } from 'use-file-picker';
import { CatalogListBox, ToolCatalogRef } from './CatalogListBox';
import { useKeyEvent } from '@/hooks/useKeyEvent';
import { useClickOutside } from '@/hooks/useClickOutside';

/*
    note(tylerslaton):

    This component really needs refactoring but due to time I'm leaving it as is. To
    assist with anyone touching this in the future (or myself) here are some notes.

    The big problem with this component is that the chatBar is handing off the focus
    based on events. Each component knows what the hand off via a className. The ChatBar
    component is setting the focus to whatever the current 0th command is at the command-0
    class. This is then passing it back whenever text is input via the onKeyDown event.

    There is also some functionality where keyDown being an up-arrow in the chat bar will
    pass the focus to this component but this component *also* has a keyDown event that
    looks for the up-arrow. As such I have a keyDownCapture event that will pass the focus
    to the previous command in the list. This is a bit hacky but it works for now.
*/

const Command = {
  Restart: 'restart',
  ToolCatalog: 'addToolFromCatalog',
  AddExternalTools: 'addToolFromUrl',
  Workspace: 'workspace',
  Knowledge: 'knowledge',
} as const;
type Command = (typeof Command)[keyof typeof Command];

const options = [
  {
    title: 'Restart Chat',
    command: Command.Restart,
    description: 'Restart the current assistant to get a new session',
    icon: <GoIssueReopened className="mr-2" />,
  },
  {
    title: 'Add Knowledge',
    command: Command.Knowledge,
    description:
      'Add knowledge to the current assistant to extend functionality',
    icon: <GoPaperclip className="mr-2" />,
  },
  {
    title: 'Add Tool from Catalog',
    command: Command.ToolCatalog,
    description: 'Add tools to the current assistant to extend functionality',
    icon: <PiToolbox className="mr-2" />,
  },
  {
    title: 'Add Tool from URL',
    command: Command.AddExternalTools,
    description: 'Add tool to the current assistant via URL',
    icon: <GoGlobe className="mr-2" />,
  },
  {
    title: 'Manage Workspace',
    command: Command.Workspace,
    description:
      'Manage the workspace which contains the files the assistant has access to',
    icon: <GoInbox className="mr-2" />,
  },
];

interface CommandsProps {
  inputElement: HTMLTextAreaElement | null;
  text: string;
  setText: (text: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCatalogOpen: boolean;
  setIsCatalogOpen: (open: boolean) => void;
  children: React.ReactNode;
}

export type ChatCommandsRef = {
  focusCommands: () => void;
  focusCatalog: () => void;
};

export default forwardRef<ChatCommandsRef, CommandsProps>(
  function Commands(props, ref) {
    const {
      text,
      setText,
      isOpen,
      setIsOpen,
      isCatalogOpen,
      setIsCatalogOpen,
      children,
      inputElement,
    } = props;

    const [filteredOptions, setFilteredOptions] =
      useState<typeof options>(options);

    const { restartScript, socket, setMessages, tools, workspace, thread } =
      useContext(ChatContext);
    const [uploadOpen, setUploadOpen] = React.useState(false);
    const { openFilePicker, filesContent, loading, plainFiles } = useFilePicker(
      {}
    );

    const toolcatalogRef = useRef<ToolCatalogRef>(null);

    useImperativeHandle(ref, () => ({
      focusCommands: () => document.getElementById('command-0')?.focus(),
      focusCatalog: () => toolcatalogRef.current?.focus(),
    }));

    useEffect(() => {
      if (!text.startsWith('/')) {
        setIsOpen(false);
        return;
      }

      const command = text.slice(1).toLowerCase();
      if (!command) return setFilteredOptions(options);

      setFilteredOptions(
        options.filter((option) => option.command.startsWith(command))
      );
    }, [text]);

    useEffect(() => {
      const uploadKnowledge = async () => {
        if (loading) return;
        if (!filesContent.length) return;

        const gatewayKnowledgeTool = gatewayTool();

        try {
          for (const file of plainFiles) {
            const formData = new FormData();
            formData.append('file', file);
            setMessages((prev) => [
              ...prev,
              {
                type: MessageType.Alert,
                name: prev ? prev[prev.length - 1].name : undefined,
                icon: <GoPaperclip className="mt-1" />,
                message: `Uploading knowledge ${file.name}`,
              },
            ]);
            await uploadFile(workspace, formData, true);
          }
          await ingest(workspace, getCookie('gateway_token'), thread);
          setMessages((prev) => [
            ...prev,
            {
              type: MessageType.Alert,
              icon: <GoCheckCircleFill className="mt-1" />,
              name: prev ? prev[prev.length - 1].name : undefined,
              message: `Successfully uploaded knowledge ${plainFiles.map((f) => f.name).join(', ')}`,
            },
          ]);
          if (!tools || !tools.includes(gatewayKnowledgeTool)) {
            socket?.emit('addTool', gatewayKnowledgeTool);
          }
        } catch (e) {
          setMessages((prev) => [
            ...prev,
            {
              type: MessageType.Alert,
              name: prev ? prev[prev.length - 1].name : undefined,
              icon: <GoAlert className="mt-1" />,
              message: `Error uploading knowledge ${filesContent.map((f) => f.name).join(', ')}: ${e}`,
            },
          ]);
        }
      };
      uploadKnowledge();
    }, [filesContent, loading]);

    const handleSelect = (value: Command) => {
      switch (value) {
        case Command.Restart:
          restartScript();
          break;
        case Command.ToolCatalog:
          setIsCatalogOpen(true);
          break;
        case Command.AddExternalTools:
          urlToolModal.onOpen();
          break;
        case Command.Workspace:
          setUploadOpen(true);
          break;
        case Command.Knowledge:
          openFilePicker();
          break;
      }

      setText('');
      setIsOpen(false);
    };

    const [loadingTool, setLoadingTool] = useState<string | null>(null);
    const loadingToolRef = useRef<string | null>(null);
    loadingToolRef.current = loadingTool;

    // TODO: replace with useSWR once imported
    const addTool = useAsync(async (tool: string) => {
      if (tools.includes(tool)) throw new Error('Tool already added');

      setLoadingTool(tool);
      const [foundTool] = await parseBlock(tool);

      if (!foundTool) {
        throw new Error(`Tool ${tool} does not exist`);
      }

      socket?.emit('addTool', tool);
    });

    const urlToolModal = useDisclosure({
      onClose: addTool.clear,
      onOpen: addTool.clear,
    });

    useEffect(() => {
      if (!loadingToolRef.current || !tools.includes(loadingToolRef.current))
        return;

      setLoadingTool(null);
      urlToolModal.onClose();
      setIsCatalogOpen(false);

      const toolRef = loadingToolRef.current;

      getToolDisplayName(toolRef).then((name) => {
        setMessages((prev) => [
          ...prev,
          {
            type: MessageType.Alert,
            icon: <GoTools className="mt-1" />,
            name: prev ? prev[prev.length - 1].name : undefined,
            component: (
              <ToolActionChatMessage
                action="Added"
                name={name}
                toolRef={toolRef}
              />
            ),
          },
        ]);
      });
    }, [tools]);

    useEffect(() => {
      setLoadingTool(null);
    }, [addTool.error]);

    useKeyEvent({
      key: 'Escape',
      onKeyEvent: () => {
        setIsCatalogOpen(false);
        setIsOpen(false);
        inputElement?.focus();
      },
      disable: !isCatalogOpen && !isOpen,
    });

    const childrenRef = useRef<HTMLDivElement>(null);

    const catalogClickOutsideRef = useClickOutside({
      onClickOutside: () => setIsCatalogOpen(false),
      action: 'mousedown',
      disable: !isCatalogOpen,
      whitelist: [childrenRef.current].filter((el) => !!el),
    });

    const commandClickOutsideRef = useClickOutside({
      onClickOutside: () => setIsOpen(false),
      action: 'mousedown',
      disable: !isOpen,
      whitelist: [childrenRef.current].filter((el) => !!el),
    });

    return (
      <div className="relative w-full h-3/4 command-options">
        <Upload isOpen={uploadOpen} setIsOpen={setUploadOpen} />
        {isCatalogOpen && (
          <Card className="absolute bottom-14 p-4" ref={catalogClickOutsideRef}>
            <CatalogListBox
              ref={toolcatalogRef}
              query={text}
              loading={loadingTool}
              equippedTools={tools}
              onAddTool={addTool.execute}
              onUncapturedKeyDown={() => inputElement?.focus()}
            />
          </Card>
        )}

        <UrlToolModal
          isOpen={urlToolModal.isOpen}
          onAddTool={addTool.execute}
          onClose={urlToolModal.onClose}
          error={(addTool.error as Error)?.message}
          isLoading={!!loadingTool || addTool.pending}
        />

        {isOpen && !!filteredOptions.length && (
          <Card
            className="absolute bottom-14 w-full p-4"
            ref={commandClickOutsideRef}
          >
            <Listbox aria-label="commands">
              {
                filteredOptions
                  .map((option, index) => (
                    <ListboxItem
                      aria-label="command"
                      key={index}
                      value={option.title}
                      onClick={() => handleSelect(option.command)}
                      startContent={option.icon}
                      id={`command-${index}`}
                      description={option.description}
                      // Handle selecting the command or closing the modal in a terrible awful way.
                      onKeyDown={(e) => {
                        e.preventDefault();
                        switch (e.key) {
                          case 'Enter':
                            handleSelect(option.command);
                            break;
                          case 'ArrowUp':
                          case 'ArrowDown':
                            break;
                          case 'Escape':
                            setIsOpen(false);
                          // eslint-disable-next-line no-fallthrough
                          default:
                            inputElement?.focus();
                            break;
                        }
                      }}
                      // Handle navigating the list of commands (also in a terrible awful way)
                      onKeyDownCapture={(e) => {
                        e.preventDefault();
                        switch (e.key) {
                          case 'ArrowUp':
                            // eslint-disable-next-line no-case-declarations
                            const prev = document.getElementById(
                              `command-${index - 1}`
                            );
                            if (prev) prev.focus();
                            break;
                          case 'ArrowDown':
                            // eslint-disable-next-line no-case-declarations
                            const next = document.getElementById(
                              `command-${index + 1}`
                            );
                            if (next) next.focus();
                            break;
                        }
                      }}
                    >
                      {option.title}
                    </ListboxItem>
                  ))
                  .reverse() /* reverse the order to make navigating the commands more intuitive */
              }
            </Listbox>
          </Card>
        )}
        <div ref={childrenRef}>{children}</div>
      </div>
    );
  }
);
