import {
  Button,
  DropdownMenu,
  Dropdown,
  DropdownTrigger,
  DropdownItem,
} from '@nextui-org/react';
import React, { useContext } from 'react';
import { ChatContext } from '@/contexts/chat';
import { PiFloppyDiskThin, PiUser } from 'react-icons/pi';
import { updateScript } from '@/actions/me/scripts';
import { stringify } from '@/actions/gptscript';
import { gatewayTool } from '@/actions/knowledge/util';
import { MessageType } from '@/components/chat/messages';

const SaveScriptDropdown = () => {
  const {
    scriptId,
    tools,
    socket,
    scriptContent,
    setScriptContent,
    setMessages,
  } = useContext(ChatContext);

  const knowledgeTool = gatewayTool();

  function saveScript() {
    // The knowledge tool is dynamic and not controlled by the user. Don't add it to the saved tool.
    const addedTools = tools.filter((t) => t !== knowledgeTool);

    // find the root tool and then add the new tool
    for (const block of scriptContent!) {
      if (block.type === 'tool') {
        block.tools = (block.tools || [])
          .filter((t) => !addedTools.includes(t))
          .concat(...addedTools);
        break;
      }
    }

    stringify(scriptContent).then((content) => {
      updateScript({
        content: content,
        id: parseInt(scriptId!),
      }).then(() => {
        setScriptContent([...scriptContent]);
        socket?.emit('saveScript');
        setMessages((prev) => [
          ...prev,
          {
            type: MessageType.Alert,
            icon: <PiUser className="mt-1" />,
            name: prev ? prev[prev.length - 1].name : undefined,
            message: `Assistant Saved`,
          },
        ]);
      });
    });
  }

  return (
    <Dropdown placement="bottom-start">
      <DropdownTrigger>
        <Button variant="light" isIconOnly>
          <PiFloppyDiskThin className="size-5" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        {scriptId ? (
          <DropdownItem key="save" onPress={saveScript}>
            Save Assistant
          </DropdownItem>
        ) : (
          (null as any)
        )}
      </DropdownMenu>
    </Dropdown>
  );
};

export default SaveScriptDropdown;
