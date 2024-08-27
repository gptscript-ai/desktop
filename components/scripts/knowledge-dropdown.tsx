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
import { ingest } from '@/actions/knowledge/knowledge';
import { gatewayTool, getCookie } from '@/actions/knowledge/util';
import { Dirent } from 'fs';

const ScriptKnowledgeDropdown = () => {
  const { socket, workspace, selectedThreadId, program, setMessages } =
    useContext(ChatContext);
  const [knowledgeFiles, setKnowledgeFiles] = useState<string[]>([]);

  function refreshKnowledgeFiles(isOpen: boolean) {
    if (!isOpen) return;
    lsKnowledgeFiles(workspace).then((files) =>
      setKnowledgeFiles(JSON.parse(files).map((f: Dirent) => f.name))
    );
  }

  function removeFile(file: string) {
    deleteKnowledgeFile(workspace, file).then(() => {
      ingest(workspace, getCookie('gateway_token'), selectedThreadId).then(
        () => {
          setMessages((prev) => [
            ...prev,
            {
              type: MessageType.Alert,
              icon: <GoCheckCircleFill className="mt-1" />,
              name: prev ? prev[prev.length - 1].name : undefined,
              message: `Successfully removed knowledge ${file}`,
            },
          ]);

          const newKnowledgeFiles = knowledgeFiles.filter((f) => f !== file);
          setKnowledgeFiles(newKnowledgeFiles);
          if (newKnowledgeFiles.length === 0) {
            socket?.emit('removeTool', gatewayTool(), true);
          }
        }
      );
    });
  }

  return (
    <Dropdown
      placement="bottom"
      closeOnSelect={false}
      onOpenChange={refreshKnowledgeFiles}
    >
      <DropdownTrigger>
        <Button variant="light" isIconOnly>
          <PiBookOpenThin className="size-5" />
        </Button>
      </DropdownTrigger>
      {program && (
        <DropdownMenu
          onAction={(key) => {
            removeFile(key as string);
          }}
        >
          {knowledgeFiles && knowledgeFiles.length ? (
            <DropdownSection
              title={
                'Thread Knowledge' +
                (knowledgeFiles.length > 0 ? ' (Click to remove)' : '')
              }
            >
              {knowledgeFiles.map((f) => (
                <DropdownItem
                  aria-label={f}
                  color="danger"
                  key={f}
                  className="py-2"
                  content={f}
                  endContent={<PiXThin />}
                >
                  {f}
                </DropdownItem>
              ))}
            </DropdownSection>
          ) : (
            <DropdownItem
              aria-label="No Knowledge"
              key="No Knowledge"
              className="py-2 hover:cursor-default text-foreground-400"
              content="No Knowledge"
              isReadOnly
            >
              No Knowledge
            </DropdownItem>
          )}
        </DropdownMenu>
      )}
    </Dropdown>
  );
};

export default ScriptKnowledgeDropdown;
