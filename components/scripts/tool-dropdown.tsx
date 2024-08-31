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
import { ToolReference } from '@gptscript-ai/gptscript';

const dynamicToolName = 'Dynamic Instructions';

const ScriptToolsDropdown = () => {
  const { program, tools, socket, setMessages } = useContext(ChatContext);
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({});
  const [threadTools, setThreadTools] = useState<string[]>([]);
  const [assistantTools, setAssistantTools] = useState<
    [string, ToolReference[]][]
  >([]);

  const knowledgeGatewayTool = gatewayTool();

  useEffect(() => {
    const threadTools: string[] = [];
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

    if (program && program.toolSet) {
      setAssistantTools(
        program.toolSet[program.entryToolId].toolMapping
          ? Object.entries(
              program.toolSet[program.entryToolId].toolMapping || {}
            ).filter(([t, _]) => !threadTools.includes(t))
          : []
      );
    } else {
      setAssistantTools([]);
    }

    setThreadTools(threadTools);
  }, [tools, displayNames, knowledgeGatewayTool, program]);

  function friendlyName(name: string | undefined): string | undefined {
    if (name === 'dynamic-instructions') {
      return dynamicToolName;
    }

    return name;
  }

  function getDisplayName(ref: string): string {
    if (ref === 'dynamic-instructions') {
      return dynamicToolName;
    }

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
    socket?.emit('removeTool', tool);
    setMessages((prev) => [
      ...prev,
      {
        type: MessageType.Alert,
        icon: <GoTools className="mt-1" />,
        name: prev ? prev[prev.length - 1].name : undefined,
        message: `Removed ${displayNames[tool] || getDisplayName(tool)}`,
      },
    ]);
  }

  return (
    <Dropdown
      placement="bottom-start"
      closeOnSelect={false}
      classNames={{
        base: 'w-[300px] max-h-[520px] overflow-y-auto',
      }}
    >
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
            <DropdownSection
              title={
                `Assistant Tools` +
                (assistantTools.length
                  ? ` (${assistantTools.length} tool`
                  : '') +
                (assistantTools.length > 1
                  ? 's)'
                  : assistantTools.length
                    ? ')'
                    : '')
              }
            >
              {assistantTools.length > 0 ? (
                assistantTools.map(([t, v]) => (
                  <DropdownItem
                    aria-label={t}
                    color="primary"
                    key={t}
                    className="py-2 hover:cursor-default"
                    content={t}
                    isReadOnly
                  >
                    {friendlyName(
                      (
                        program.toolSet[
                          (v.find((v) => v.reference === t) || {}).toolID || ''
                        ] || {}
                      ).name
                    ) || getDisplayName(t)}
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
              'Thread Tools' +
              (threadTools.length ? ` (${threadTools.length} tool` : '') +
              (threadTools.length > 1 ? 's' : '') +
              (threadTools.length ? ', Click to remove)' : '')
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
