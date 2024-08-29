import { useCallback, useContext } from 'react';
import RemoteImports from '@/components/edit/configure/imports';
import Loading from '@/components/loading';
import Models from '@/components/edit/configure/models';
import Visibility from '@/components/edit/configure/visibility';
import Code from '@/components/edit/configure/code';
import { EditContext, KNOWLEDGE_NAME } from '@/contexts/edit';
import { GoLightBulb, GoTrash } from 'react-icons/go';
import { HiCog } from 'react-icons/hi2';
import { LuCircuitBoard } from 'react-icons/lu';
import {
  Textarea,
  Input,
  Avatar,
  Tooltip,
  Accordion,
  AccordionItem,
  Button,
  useDisclosure,
  Spinner,
} from '@nextui-org/react';
import { PiToolboxBold } from 'react-icons/pi';
import AssistantNotFound from '@/components/assistant-not-found';
import { useRouter } from 'next/navigation';
import { ChatContext } from '@/contexts/chat';
import Chat from '@/components/chat';
import { IoSettingsOutline } from 'react-icons/io5';
import { IoMdAdd, IoMdRefresh } from 'react-icons/io';
import { RiFileSearchLine } from 'react-icons/ri';
import FileSettingModals from '@/components/knowledge/KnowledgeModals';
import { RiFoldersLine } from 'react-icons/ri';

interface ConfigureProps {
  collapsed?: boolean;
}

const Configure: React.FC<ConfigureProps> = ({ collapsed }) => {
  const router = useRouter();

  const {
    root,
    setRoot,
    models,
    loading,
    notFound,
    visibility,
    setVisibility,
    dynamicInstructions,
    setDynamicInstructions,
    dependencies,
    setDependencies,
    setDroppedFiles,
    droppedFileDetails,
    setDroppedFileDetails,
    ingesting,
    ingest,
    updated,
    setUpdated,
    ingestionError,
  } = useContext(EditContext);
  const { restartScript } = useContext(ChatContext);
  const fileSettingModal = useDisclosure();

  const abbreviate = (name: string) => {
    const words = name.split(/(?=[A-Z])|[\s_-]/);
    const firstLetters = words.map((word) => word[0]);
    return firstLetters.slice(0, 2).join('').toUpperCase();
  };

  const setRootTools = useCallback(
    (newTools: string[]) => {
      setRoot({ ...root, tools: newTools });
      setUpdated(true);
    },
    [root]
  );

  const handleAddFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (event: any) => {
      const files = Array.from(event.target?.files);
      const filePaths = files.map((file: any) => file.path as string);
      setDroppedFiles((prevFiles: string[]) => [...prevFiles, ...filePaths]);
    };
    input.click();
  };

  const placeholderName = (): string => {
    return root.name && root.name.length > 0 ? root.name : 'your assistant';
  };

  if (loading)
    return <Loading>{`Loading your assistant's details...`}</Loading>;

  if (notFound) return <AssistantNotFound />;

  return (
    <>
      <div
        className={`h-full overflow-auto w-full border-r-2 dark:border-zinc-800 p-6 ${collapsed ? '' : 'xl:px-20'}`}
      >
        <div className="flex flex-col w-full justify-center items-center space-y-2 mb-6 mt-10">
          <Tooltip
            content={root.name || 'Unnamed Assistant'}
            placement="bottom"
            closeDelay={0.5}
          >
            <Avatar
              showFallback
              name={abbreviate(root.name || 'Unnamed Assistant')}
              className="w-[40px] cursor-default"
              classNames={{
                base: 'bg-white p-6 text-sm border dark:border-none dark:bg-zinc-900',
                name: 'text-lg text-default-600',
              }}
            />
          </Tooltip>
        </div>
        <div className="px-2 flex flex-col space-y-4 mb-6">
          <div className="relative">
            <div className="absolute top-3 right-0 z-40">
              <Visibility
                visibility={visibility}
                setVisibility={setVisibility}
              />
            </div>
            <Input
              color="primary"
              variant="bordered"
              label="Name"
              placeholder="Give your assistant a name..."
              defaultValue={root.name}
              onChange={(e) => setRoot({ ...root, name: e.target.value })}
            />
          </div>
          <Input
            color="primary"
            fullWidth
            variant="bordered"
            label="Description"
            placeholder="Describe what your assistant does..."
            defaultValue={root.description}
            onChange={(e) => setRoot({ ...root, description: e.target.value })}
          />
          <Textarea
            color="primary"
            fullWidth
            maxRows={50}
            variant="bordered"
            label="Instructions"
            placeholder="Give your assistant instructions on how to behave..."
            defaultValue={root.instructions}
            onChange={(e) => {
              setRoot({ ...root, instructions: e.target.value });
              setUpdated(true);
            }}
          />
          <Accordion isCompact fullWidth selectionMode="multiple">
            <AccordionItem
              aria-label="dynamic-instructions"
              title={<h1>Dynamic Instructions</h1>}
              startContent={<LuCircuitBoard />}
              classNames={{ content: collapsed ? 'pt-6 pb-10' : 'p-10 pt-6' }}
            >
              <div className="flex bg-primary-50 rounded-xl p-4 mb-4 text-tiny italic text-primary-500 items-center space-x-4">
                <GoLightBulb
                  className={`inline mb-1 text-sm ${collapsed ? 'w-[200px] ' : 'w-fit'} `}
                />
                <p>
                  Augment your instructions with code that can pull information
                  from local or remote systems.
                </p>
              </div>
              <Code
                code={dynamicInstructions}
                onChange={(value: string) => {
                  setDynamicInstructions(value);
                  setUpdated(true);
                }}
                dependencies={
                  dependencies.find((d) => d.forTool === 'dynamic-instructions')
                    ?.content || ''
                }
                onDependenciesChange={(code, type) => {
                  setDependencies([
                    ...dependencies.filter(
                      (d) => d.forTool !== 'dynamic-instructions'
                    ),
                    {
                      forTool: 'dynamic-instructions',
                      content: code,
                      type: type,
                    },
                  ]);
                  setUpdated(true);
                }}
              />
            </AccordionItem>
            <AccordionItem
              aria-label="remote-tools"
              title={<h1>Tools</h1>}
              startContent={<PiToolboxBold />}
              classNames={{ content: collapsed ? 'pt-6 pb-10' : 'p-10 pt-6' }}
            >
              <RemoteImports
                tools={root.tools?.filter((t) => t != KNOWLEDGE_NAME)}
                setTools={setRootTools}
                collapsed={collapsed}
              />
            </AccordionItem>
            <AccordionItem
              aria-label="files"
              title={<h1>Files</h1>}
              startContent={<RiFileSearchLine />}
              classNames={{ content: collapsed ? 'pt-6 pb-10' : 'p-10 pt-6' }}
            >
              <div className="grid grid-cols-1 gap-2 w-full mb-2">
                <div className="max-h-[30vh] flex flex-col space-y-2 overflow-auto">
                  {Array.from(droppedFileDetails.entries()).map(
                    (fileDetail, i) => (
                      <div key={i} className="flex space-x-2">
                        <div className="truncate w-full border-2 dark:border-zinc-700 text-sm pl-2 rounded-lg flex justify-between items-center">
                          <div className="flex items-center space-x-2 overflow-x-auto">
                            <RiFileSearchLine />
                            <p className="capitalize">
                              {fileDetail[1].fileName}
                            </p>
                            <p className="text-xs text-zinc-400 ml-2">{`${fileDetail[1].size} KB`}</p>
                          </div>
                          <Button
                            variant="light"
                            isIconOnly
                            size="sm"
                            startContent={<GoTrash />}
                            onPress={() => {
                              setDroppedFiles((prev) =>
                                prev.filter((f) => f !== fileDetail[0])
                              );
                              const newDetails = new Map(droppedFileDetails);
                              newDetails.delete(fileDetail[0]);
                              setDroppedFileDetails(newDetails);
                            }}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
                <div className="flex justify-end mt-2">
                  {droppedFileDetails?.size > 0 &&
                    !ingesting &&
                    !ingestionError && (
                      <div className="flex justify-center">
                        <RiFoldersLine />
                        <p className="text-sm text-zinc-500 ml-2">{`${droppedFileDetails.size} ${droppedFileDetails.size === 1 ? 'file' : 'files'}, ${Array.from(
                          droppedFileDetails.values()
                        )
                          .reduce((acc, detail) => acc + detail.size, 0)
                          .toFixed(2)} KB`}</p>
                      </div>
                    )}
                  {ingesting && !ingestionError && (
                    <Spinner size="sm" className="ml-2" />
                  )}
                  {ingestionError && (
                    <>
                      <Button
                        isIconOnly
                        variant="flat"
                        color="primary"
                        size="sm"
                        startContent={<IoMdRefresh size={18} />}
                        onClick={ingest}
                      ></Button>
                      <p className="text-sm text-red-500 ml-2">
                        {ingestionError}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div
                className={`flex ${collapsed ? 'flex-col space-y-2' : 'space-x-4'} ${droppedFileDetails.size > 0 ? 'pt-4' : ''}`}
              >
                <Button
                  className="w-full"
                  variant="flat"
                  color="primary"
                  isIconOnly
                  size="sm"
                  startContent={<IoSettingsOutline className="mr-2" />}
                  onPress={fileSettingModal.onOpen}
                >
                  Settings
                </Button>
                <Button
                  className="w-full"
                  variant="flat"
                  color="primary"
                  isIconOnly
                  size="sm"
                  startContent={<IoMdAdd className="mr-2" />}
                  onPress={handleAddFiles}
                >
                  Add Files
                </Button>
              </div>
            </AccordionItem>
            <AccordionItem
              aria-label="advanced"
              title={<h1>Advanced</h1>}
              startContent={<HiCog />}
              classNames={{
                content: collapsed
                  ? 'py-6 pt-10 h-[500px]'
                  : 'p-10 pt-6 h-[500px]',
              }}
            >
              <Models
                options={models}
                defaultValue={root.modelName}
                onChange={(model) => {
                  setRoot({ ...root, modelName: model });
                  if (root.modelName != model) setUpdated(true);
                }}
              />
            </AccordionItem>
          </Accordion>
        </div>
        <div className="w-full justify-end items-center px-2 flex gap-2 mb-6">
          <Button
            color="primary"
            onClick={() => {
              router.push('/build');
            }}
          >
            Back
          </Button>

          <span className="relative inline-flex">
            <Button
              color="primary"
              onClick={() => {
                restartScript();
                setUpdated(false);
              }}
            >
              Refresh Chat
            </Button>
            {updated && (
              <span className="absolute flex h-3 w-3 top-0 right-0 -mt-1 -mr-1">
                <span className="animate-ping-thrice absolute inline-flex h-full w-full rounded-full bg-warning-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-warning-500 m-auto"></span>
              </span>
            )}
          </span>
        </div>
      </div>
      <Chat
        messagesHeight="h-[93%]"
        className={`p-6 overflow-auto ${collapsed ? 'col-span-3 px-32' : ''}`}
        disableInput={updated}
        disableCommands={true}
        inputPlaceholder={
          !updated
            ? `Chat with ${placeholderName()}`
            : `Click "Refresh Chat" to chat with the updated version of ${placeholderName()}`
        }
      />
      <FileSettingModals
        isFileSettingOpen={fileSettingModal.isOpen}
        onFileSettingClose={fileSettingModal.onClose}
      />
    </>
  );
};

export default Configure;
