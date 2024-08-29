import {
  Button,
  DropdownMenu,
  Dropdown,
  DropdownTrigger,
  DropdownItem,
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Checkbox,
  Spinner,
} from '@nextui-org/react';
import React, { useContext, useState } from 'react';
import { ChatContext } from '@/contexts/chat';
import { PiFloppyDiskThin, PiUser } from 'react-icons/pi';
import { createScript, updateScript } from '@/actions/me/scripts';
import { stringify } from '@/actions/gptscript';
import { gatewayTool } from '@/actions/knowledge/util';
import { MessageType } from '@/components/chat/messages';
import { Input } from '@nextui-org/input';
import { updateThreadScript } from '@/actions/threads';

const SaveScriptDropdown = () => {
  const {
    selectedThreadId,
    scriptId,
    setScriptId,
    setScript,
    tools,
    socket,
    scriptContent,
    setScriptContent,
    setMessages,
  } = useContext(ChatContext);

  const [isOpen, setIsOpen] = useState(false);
  const [newScriptName, setNewScriptName] = useState('');
  const [newScriptPrivate, setNewScriptPrivate] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

  async function saveScriptAs(newName: string) {
    // The knowledge tool is dynamic and not controlled by the user. Don't add it to the saved tool.
    const addedTools = tools.filter((t) => t !== knowledgeTool);

    // find the root tool and then add the new tool
    for (const block of scriptContent!) {
      if (block.type === 'tool') {
        block.tools = (block.tools || [])
          .filter((t) => !addedTools.includes(t))
          .concat(...addedTools);
        block.name = newName;
        break;
      }
    }

    try {
      const content = await stringify(scriptContent);
      const slug =
        newName.toLowerCase().replaceAll(' ', '-') +
        '-' +
        Math.random().toString(36).substring(2, 7);

      const newScript = await createScript({
        displayName: newName,
        slug: slug,
        content: content,
        visibility: newScriptPrivate ? 'private' : 'public',
      });

      setScriptContent([...scriptContent]);
      socket?.emit('saveScript');

      await updateThreadScript(
        selectedThreadId!,
        '' + newScript.id,
        newScript.publicURL || ''
      );

      setScriptId('' + newScript.id);
      setScript(newScript.publicURL!);

      setSuccessMessage(`New Assistant Saved As ${newScript.displayName}`);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setIsOpen(false);
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.toString());
    }

    setSaving(false);
  }

  return (
    <>
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
          <DropdownItem key="save-as" onPress={() => setIsOpen(true)}>
            Save Assistant As
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal backdrop="opaque" isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Name Your New Assistant
          </ModalHeader>
          <ModalBody>
            <Input
              aria-label="new name"
              label="New Name"
              value={newScriptName}
              onChange={(e) => setNewScriptName(e.target.value)}
            />
            <Checkbox
              defaultSelected={newScriptPrivate}
              onChange={(e) => setNewScriptPrivate(e.target.checked)}
            >
              Private
            </Checkbox>
            <p className="text-red-500">{errorMessage}</p>
            <p className="text-green-500">{successMessage}</p>
          </ModalBody>
          <ModalFooter>
            <Button
              disabled={saving}
              aria-label="save-as"
              color="primary"
              onPress={() => {
                setSaving(true);
                saveScriptAs(newScriptName);
              }}
            >
              {saving ? (
                <Spinner size="sm" className="text-center" color="white" />
              ) : (
                'Save As'
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SaveScriptDropdown;
