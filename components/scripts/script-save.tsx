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
import { createScript } from '@/actions/me/scripts';
import { stringify } from '@/actions/gptscript';
import { getCookie } from '@/actions/knowledge/util';
import { MessageType } from '@/components/chat/messages';
import { Input } from '@nextui-org/input';
import { updateThreadScript } from '@/actions/threads';
import { clearThreadKnowledge, lsKnowledgeFiles } from '@/actions/upload';
import { ensureFilesIngested, getFiles } from '@/actions/knowledge/knowledge';
import { Dirent } from 'fs';
import path from 'path';
import { GoPaperclip } from 'react-icons/go';

const SaveScriptDropdown = () => {
  const {
    workspace,
    thread,
    scriptId,
    setScriptId,
    setScript,
    tools,
    socket,
    scriptContent,
    setMessages,
    setHasRun,
  } = useContext(ChatContext);

  const [isOpen, setIsOpen] = useState(false);
  const [newScriptName, setNewScriptName] = useState('');
  const [newScriptPrivate, setNewScriptPrivate] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function saveKnowledge(
    scriptId: string,
    oldScriptId?: string
  ): Promise<void> {
    const threadKnowledge = JSON.parse(
      await lsKnowledgeFiles(workspace)
    ) as Dirent[];
    const allFiles = threadKnowledge.map((file) =>
      path.join(file.path, file.name)
    );

    if (oldScriptId) {
      allFiles.push(...(await getFiles(oldScriptId)));
    }

    if (allFiles.length) {
      setMessages((prev) => [
        ...prev,
        {
          type: MessageType.Alert,
          icon: <GoPaperclip className="mt-1" />,
          name: prev ? prev[prev.length - 1].name : undefined,
          message: `Saving Knowledge to Assistant...`,
        },
      ]);

      // Move the knowledge files from the thread workspace to the assistant data directory.
      const ingestionError = await ensureFilesIngested(
        allFiles,
        true,
        scriptId,
        getCookie('gateway_token')
      );

      if (ingestionError) {
        throw Error(ingestionError);
      }

      await clearThreadKnowledge(workspace);
    }
    return;
  }

  async function saveScript() {
    try {
      await saveKnowledge(scriptId!);

      socket?.emit('saveScript', scriptId);
      setMessages((prev) => [
        ...prev,
        {
          type: MessageType.Alert,
          icon: <PiUser className="mt-1" />,
          name: prev ? prev[prev.length - 1].name : undefined,
          message: `Assistant Saved`,
        },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          type: MessageType.Alert,
          icon: <PiUser className="mt-1" />,
          name: prev ? prev[prev.length - 1].name : undefined,
          message: `Failed to Save Assistant: ${e.toString()}`,
        },
      ]);
    }
  }

  async function saveScriptAs(newName: string) {
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
      const newScriptId = '' + newScript.id;
      await saveKnowledge(newScriptId, scriptId);

      socket?.emit('saveScript', newScriptId, newName);

      await updateThreadScript(thread, newScriptId, newScript.publicURL || '');

      setMessages((prev) => [
        ...prev,
        {
          type: MessageType.Alert,
          icon: <PiUser className="mt-1" />,
          name: prev ? prev[prev.length - 1].name : undefined,
          message: `Assistant Saved`,
        },
      ]);

      setSuccessMessage(`New Assistant Saved As ${newScript.displayName}`);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setScriptId(newScriptId);
      setScript(newScript.publicURL!);
      // Set hasRun to false so that everything reloads.
      setHasRun(false);

      setIsOpen(false);
    } catch (e: any) {
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
        <DropdownMenu
          disabledKeys={
            !scriptId || !tools || !tools.length ? ['save'] : undefined
          }
        >
          <DropdownItem key="save" onPress={saveScript}>
            Save Assistant
          </DropdownItem>
          <DropdownItem key="save-as" onPress={() => setIsOpen(true)}>
            Save Assistant As...
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
                'Save'
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SaveScriptDropdown;
