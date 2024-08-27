import {
  Button,
  DropdownMenu,
  Dropdown,
  DropdownTrigger,
  DropdownSection,
  DropdownItem,
} from '@nextui-org/react';
import React, { useContext, useEffect, useState } from 'react';
import { ChatContext } from '@/contexts/chat';
import { PiToolboxThin, PiXThin } from 'react-icons/pi';
import { MessageType } from '@/components/chat/messages';
import { GoTools } from 'react-icons/go';
import { load } from '@/actions/gptscript';
import { gatewayTool } from '@/actions/knowledge/util';

const ScriptToolsDropdown = () => {
  const { program, tools, socket, setMessages } = useContext(ChatContext);
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({});
  const [threadTools, setThreadTools] = useState<string[]>([]);

  const knowledgeGatewayTool = gatewayTool();

  useEffect(() => {
    const threadTools = [];
    for (const tool of tools) {
      if (tool !== knowledgeGatewayTool) {
        threadTools.push(tool);
        if (!displayNames[tool]) {
          load(tool).then((loadedTool) => {
            const loadedName = loadedTool.toolSet[loadedTool.entryToolId].name;
            if (loadedName) {
              setDisplayNames((prev) => ({
                ...prev,
                [tool]: loadedName,
              }));
            }
          });
        }
      }
    }

    setThreadTools(threadTools);
  }, [tools, displayNames, knowledgeGatewayTool]);

  function getDisplayName(ref: string): string {
    return (
      ref
        .split('/')
        .pop()
        ?.replace('sys.', '')
        .replace('.', ' ')
        .replace(/-/g, ' ') ?? ref.replace(/-/g, ' ')
    )
      .toLowerCase()
      .split(' ')
      .map((word: any) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  function removeTool(tool: string) {
    socket?.emit('removeTool', tool, true);
    setMessages((prev) => [
      ...prev,
      {
        type: MessageType.Alert,
        icon: <GoTools className="mt-1" />,
        name: prev ? prev[prev.length - 1].name : undefined,
        message: `Removed ${displayNames[tool]}`,
      },
    ]);
  }

  return (
    <Dropdown placement="bottom" closeOnSelect={false}>
      <DropdownTrigger>
        <Button variant="light" isIconOnly>
          <PiToolboxThin className="size-5" />
        </Button>
      </DropdownTrigger>
      {program && (
        <DropdownMenu
          onAction={(key) => {
            removeTool(key as string);
          }}
        >
          {program.toolSet && (
            <DropdownSection title="Assistant's Tools">
              {program.toolSet[program.entryToolId].toolMapping ? (
                Object.entries(
                  program.toolSet[program.entryToolId].toolMapping || {}
                ).map(([t, v]) => (
                  <DropdownItem
                    aria-label={t}
                    color="primary"
                    key={t}
                    className="py-2 hover:cursor-default"
                    content={t}
                    isReadOnly
                  >
                    {program.toolSet[
                      (v.find((v) => v.reference === t) || {}).toolID || ''
                    ].name || getDisplayName(t)}
                  </DropdownItem>
                ))
              ) : (
                <DropdownItem
                  aria-label="No tools"
                  color="primary"
                  key="No tools"
                  className="py-2 hover:cursor-default text-foreground-400"
                  content="No tools"
                  isReadOnly
                >
                  No tools
                </DropdownItem>
              )}
            </DropdownSection>
          )}
          <DropdownSection
            title={
              "Thread's Tools" +
              (threadTools.length > 0 ? ' (Click to remove)' : '')
            }
          >
            {threadTools && threadTools.length ? (
              threadTools.map((t) => (
                <DropdownItem
                  aria-label={t}
                  color="danger"
                  key={t}
                  className="py-2"
                  content={t}
                  endContent={<PiXThin />}
                >
                  {displayNames[t] || t}
                </DropdownItem>
              ))
            ) : (
              <DropdownItem
                aria-label="No tools"
                color="danger"
                key="No tools"
                className="py-2 hover:cursor-default text-foreground-400"
                content="No tools"
                isReadOnly
              >
                No tools
              </DropdownItem>
            )}
          </DropdownSection>
        </DropdownMenu>
      )}
    </Dropdown>
  );
};

export default ScriptToolsDropdown;
