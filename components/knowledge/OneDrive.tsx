import {
  Avatar,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from '@nextui-org/react';
import React, { useContext, useEffect, useState } from 'react';
import { IoMdRefresh } from 'react-icons/io';
import {
  getOneDriveFiles,
  isOneDriveConfigured,
  runOneDriveSync,
  syncSharedLink,
} from '@/actions/knowledge/onedrive';
import { CiSearch, CiShare1 } from 'react-icons/ci';
import { EditContext } from '@/contexts/edit';
import { importFiles } from '@/actions/knowledge/filehelper';
import { Link } from '@nextui-org/react';
import { syncFiles } from '@/actions/knowledge/tool';
import { BiPlus } from 'react-icons/bi';

interface OnedriveFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSyncing: boolean;
  setIsSyncing: React.Dispatch<React.SetStateAction<boolean>>;
  onedriveConfigured: boolean;
  setOnedriveConfigured: React.Dispatch<React.SetStateAction<boolean>>;
  syncError: string;
  setSyncError: React.Dispatch<React.SetStateAction<string>>;
}

export const OnedriveFileModal = ({
  isOpen,
  onClose,
  onedriveConfigured,
  setOnedriveConfigured,
  isSyncing,
  setIsSyncing,
  syncError,
  setSyncError,
}: OnedriveFileModalProps) => {
  const { droppedFiles, setDroppedFiles } = useContext(EditContext);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const externalLinkModal = useDisclosure();
  const [sharedLink, setSharedLink] = useState<string>('');

  const [onedriveFiles, setOnedriveFiles] = useState<
    Map<string, { url: string; fileName: string; displayName: string }>
  >(new Map());

  const [selectedFile, setSelectedFile] = useState<string[]>(
    Array.from(droppedFiles.keys())
  );

  useEffect(() => {
    if (onedriveConfigured) return;

    const setConfigured = async () => {
      setOnedriveConfigured(await isOneDriveConfigured());
    };
    setConfigured();
  }, [onedriveConfigured, isOpen]);

  useEffect(() => {
    if (!onedriveConfigured) return;

    const setFiles = async () => {
      const onedriveFiles = await getOneDriveFiles();
      setOnedriveFiles(onedriveFiles);
    };

    setFiles();
  }, [isOpen, onedriveConfigured]);

  const onClickImport = async () => {
    setImporting(true);
    try {
      await syncFiles(selectedFile, 'onedrive');
      const files = await importFiles(selectedFile);
      setDroppedFiles((prev) => {
        const newMap = new Map(prev);
        for (const [key, file] of Array.from(newMap.entries())) {
          if (file.type === 'onedrive') {
            newMap.delete(key);
          }
        }
        for (const [key, file] of Array.from(files.entries())) {
          newMap.set(key, file);
        }
        return newMap;
      });
    } finally {
      setImporting(false);
    }

    onClose();
  };

  const syncOnedrive = async () => {
    setIsSyncing(true);
    try {
      const isConfigured = await isOneDriveConfigured();
      await runOneDriveSync(isConfigured);
      setOnedriveConfigured(isConfigured);
      setOnedriveFiles(await getOneDriveFiles());
      setSyncError('');
    } catch (e) {
      setSyncError((e as Error).toString());
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectedFileChange = (selected: any) => {
    if (selected === 'all') {
      setSelectedFile(Array.from(onedriveFiles.keys()));
    } else {
      setSelectedFile(Array.from(selected));
    }
  };

  const addSharedLink = async () => {
    setIsSyncing(true);
    externalLinkModal.onClose();
    try {
      await syncSharedLink(sharedLink);
      setOnedriveFiles(await getOneDriveFiles());
      setSharedLink('');
    } catch (e) {
      setSyncError((e as Error).toString());
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <Modal
        size="4xl"
        isOpen={isOpen}
        onClose={onClose}
        hideCloseButton={true}
        scrollBehavior="inside"
        className="min-h-[40vh] max-h-[80vh]"
      >
        <ModalContent>
          <ModalHeader>
            <div className="w-full flex items-center justify-between">
              <div className="flex flex-row items-center">
                <Avatar
                  size="sm"
                  src="onedrive.svg"
                  alt="Onedrive Icon"
                  classNames={{ base: 'p-1.5 bg-white' }}
                />
                <p className="ml-2">Onedrive</p>
              </div>

              <div className="flex items-center justify-end p-2">
                <Button
                  size="sm"
                  color="primary"
                  isLoading={isSyncing}
                  startContent={!isSyncing && <IoMdRefresh />}
                  onClick={syncOnedrive}
                >
                  {!isSyncing && 'Sync'}
                </Button>
                {syncError && (
                  <p className="text-sm text-red-500 ml-2">{syncError}</p>
                )}
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="justify-between flex">
              <Input
                className="w-[20%] flex justify-end"
                placeholder="Search"
                size="sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                startContent={<CiSearch />}
              />
              <Button
                isIconOnly
                size="sm"
                color="primary"
                startContent={<BiPlus />}
                onClick={() => {
                  externalLinkModal.onOpen();
                }}
              />
            </div>

            {onedriveConfigured && onedriveFiles.size > 0 ? (
              <div className="flex flex-col gap-1">
                <Table
                  selectionMode="multiple"
                  selectionBehavior="toggle"
                  aria-label="onedrive-files"
                  isCompact={true}
                  defaultSelectedKeys={selectedFile}
                  onSelectionChange={(selected) => {
                    handleSelectedFileChange(selected);
                  }}
                >
                  <TableHeader>
                    <TableColumn>Name</TableColumn>
                    <TableColumn>Link</TableColumn>
                  </TableHeader>
                  <TableBody
                    items={Array.from(onedriveFiles.entries())
                      .sort((a, b) => {
                        if (a[1].displayName < b[1].displayName) {
                          return -1;
                        } else if (a[1].displayName > b[1].displayName) {
                          return 1;
                        } else {
                          return 0;
                        }
                      })
                      .filter(([_, file]) => {
                        if (!searchQuery) return true;
                        return file.displayName
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase());
                      })}
                  >
                    {([key, value]) => (
                      <TableRow key={key}>
                        <TableCell>
                          <div className="flex flex-col">
                            <p>{value.displayName}</p>
                          </div>
                        </TableCell>
                        <TableCell className="w-[80px]">
                          <Button
                            isIconOnly
                            as={Link}
                            isExternal
                            href={value.url}
                            size="sm"
                            color="primary"
                            variant="flat"
                            startContent={<CiShare1 />}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-zinc-500">
                  {`Click the "Sync" button to sync your Onedrive files`}
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              isLoading={importing}
              color="primary"
              size="sm"
              onClick={onClickImport}
            >
              Import
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={externalLinkModal.isOpen}
        onClose={externalLinkModal.onClose}
      >
        <ModalContent>
          <ModalHeader>Shared Link</ModalHeader>
          <ModalBody>
            <Input
              placeholder={'Add shared link for documents'}
              value={sharedLink}
              onChange={(e) => setSharedLink(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              disabled={isSyncing}
              size="sm"
              onClick={() => {
                addSharedLink();
              }}
            >
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
