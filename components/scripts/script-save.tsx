import {
  Button,
  DropdownMenu,
  Dropdown,
  DropdownTrigger,
  DropdownItem,
} from '@nextui-org/react';
import React, { useContext } from 'react';
import { ChatContext } from '@/contexts/chat';
import { PiFloppyDiskThin } from 'react-icons/pi';
import { getScript, Script, updateScript } from '@/actions/me/scripts';
import { stringify } from '@/actions/gptscript';
import { gatewayTool } from '@/actions/knowledge/util';

const SaveScriptDropdown = () => {
  const { scriptId, rootTool, setRootTool, tools, socket, setScriptContent } =
    useContext(ChatContext);

  const knowledgeTool = gatewayTool();

  async function saveScript() {
    if (!rootTool.tools || rootTool.tools.length === 0) {
      rootTool.tools = [];
    }

    // The knowledge tool is dynamic and not controlled by the user. Don't add it to the saved tool.
    const addedTools = tools.filter((t) => t !== knowledgeTool);

    rootTool.tools = rootTool.tools
      .filter((t) => !addedTools.includes(t))
      .concat(...addedTools);
    try {
      await updateScript({
        content: await stringify([rootTool]),
        id: parseInt(scriptId!),
      } as Script);

      socket?.emit('removeTool', addedTools, false);
      setRootTool(rootTool);

      setScriptContent((await getScript(scriptId!))?.script || null);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Dropdown placement="bottom">
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
