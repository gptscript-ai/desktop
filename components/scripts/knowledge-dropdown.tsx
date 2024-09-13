import {
  Button,
  DropdownMenu,
  Dropdown,
  DropdownTrigger,
  DropdownSection,
  DropdownItem,
} from '@nextui-org/react';
import React, { useContext, useState } from 'react';
import { ChatContext } from '@/contexts/chat';
import { PiBookOpenThin, PiXThin } from 'react-icons/pi';
import { MessageType } from '@/components/chat/messages';
import { GoCheckCircleFill } from 'react-icons/go';
import { deleteKnowledgeFile, lsKnowledgeFiles } from '@/actions/upload';
import { getFiles, ingest } from '@/actions/knowledge/knowledge';
import { gatewayTool, getCookie } from '@/actions/knowledge/util';
import { Dirent } from 'fs';
import path from 'path';

const ScriptKnowledgeDropdown = () => {
  const { socket, scriptId, workspace, thread, program, setMessages } =
    useContext(ChatContext);
  const [threadKnowledgeFiles, setThreadKnowledgeFiles] = useState<string[]>(
    []
  );
  const [assistantKnowledgeFiles, setAssistantKnowledgeFiles] = useState<
    string[]
  >([]);
  const [assistantExpanded, setAssistantExpanded] = useState(false);
  const [threadExpanded, setThreadExpanded] = useState(false);

  async function refreshKnowledgeFiles(isOpen: boolean) {
    if (!isOpen) return;
    try {
      const files = await lsKnowledgeFiles(workspace);
      setThreadKnowledgeFiles(JSON.parse(files).map((f: Dirent) => f.name));
    } catch {
      setThreadKnowledgeFiles([]);
    }

    try {
      const files = await getFiles(scriptId!);
      setAssistantKnowledgeFiles(
        Array.from(files.keys()).map((f) => path.basename(f))
      );
    } catch {
      setAssistantKnowledgeFiles([]);
    }

    setAssistantExpanded(false);
    setThreadExpanded(false);
  }

  async function removeFile(file: string) {
    await deleteKnowledgeFile(workspace, file);
    await ingest(workspace, getCookie('gateway_token'), thread);
    setMessages((prev) => [
      ...prev,
      {
        type: MessageType.Alert,
        icon: <GoCheckCircleFill className="mt-1" />,
        name: prev ? prev[prev.length - 1].name : undefined,
        message: `Successfully removed knowledge ${file}`,
      },
    ]);

    const newKnowledgeFiles = threadKnowledgeFiles.filter((f) => f !== file);
    setThreadKnowledgeFiles(newKnowledgeFiles);
    if (newKnowledgeFiles.length === 0) {
      socket?.emit('removeTool', gatewayTool());
    }
  }

  return (
    <Dropdown
      placement="bottom-start"
      closeOnSelect={false}
      onOpenChange={refreshKnowledgeFiles}
      classNames={{
        base: 'w-[300px] max-h-[520px] overflow-y-auto',
      }}
    >
      <DropdownTrigger>
        <Button variant="light" isIconOnly>
          <PiBookOpenThin className="size-5" />
        </Button>
      </DropdownTrigger>
      {program && (
        <DropdownMenu
          onAction={(key) => {
            if (key !== 'show-all') {
              removeFile(key as string);
            }
          }}
        >
          <DropdownSection
            title={
              'Assistant Knowledge' +
              (assistantKnowledgeFiles.length
                ? ` (${assistantKnowledgeFiles.length} file`
                : '') +
              (assistantKnowledgeFiles.length > 1
                ? 's)'
                : assistantKnowledgeFiles.length
                  ? ')'
                  : '')
            }
          >
            {assistantKnowledgeFiles.length ? (
              assistantKnowledgeFiles.map((f, i) => (
                <DropdownItem
                  aria-label={f}
                  key={f}
                  className={
                    'py-2 hover:cursor-default' +
                    (i > 9 && !assistantExpanded ? ' hidden' : '')
                  }
                  content={f}
                  isReadOnly
                >
                  {f}
                </DropdownItem>
              ))
            ) : (
              <DropdownItem
                aria-label="No Assistant Knowledge"
                key="No Assistant Knowledge"
                className="py-2 hover:cursor-default text-foreground-400"
                content="No Assistant Knowledge"
                isReadOnly
              >
                No Assistant Knowledge
              </DropdownItem>
            )}
            {assistantKnowledgeFiles.length > 9 && !assistantExpanded ? (
              <DropdownItem
                aria-label="Show All"
                key="show-all"
                className="py-0"
                content="Show All"
                onPress={() => setAssistantExpanded(true)}
              >
                <span className="text-xs"> Show All</span>
              </DropdownItem>
            ) : (
              (null as any)
            )}
          </DropdownSection>
          <DropdownSection
            title={
              'Thread Knowledge' +
              (threadKnowledgeFiles.length
                ? ` (${threadKnowledgeFiles.length} file`
                : '') +
              (threadKnowledgeFiles.length > 1 ? 's' : '') +
              (threadKnowledgeFiles.length ? ', Click to remove)' : '')
            }
          >
            {threadKnowledgeFiles.length ? (
              threadKnowledgeFiles.map((f, i) => (
                <DropdownItem
                  aria-label={f}
                  color="danger"
                  key={f}
                  className={
                    'py-2' + (i > 9 && !threadExpanded ? ' hidden' : '')
                  }
                  content={f}
                  endContent={<PiXThin />}
                >
                  {f}
                </DropdownItem>
              ))
            ) : (
              <DropdownItem
                aria-label="No Thread Knowledge"
                key="No Thread Knowledge"
                className="py-2 hover:cursor-default text-foreground-400"
                content="No Thread Knowledge"
                isReadOnly
              >
                No Thread Knowledge
              </DropdownItem>
            )}
            {threadKnowledgeFiles.length > 9 && !threadExpanded ? (
              <DropdownItem
                aria-label="Show All"
                key="show-all"
                className="py-0"
                content="Show All"
                onPress={() => setThreadExpanded(true)}
              >
                <span className="text-xs"> Show All</span>
              </DropdownItem>
            ) : (
              (null as any)
            )}
          </DropdownSection>
        </DropdownMenu>
      )}
    </Dropdown>
  );
};

export default ScriptKnowledgeDropdown;
