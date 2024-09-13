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
import {
  clearOneDriveFiles,
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
  const { droppedFiles, ensureImportedFiles } = useContext(EditContext);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [sharedLink, setSharedLink] = useState<string>('');
  const [isClearing, setIsClearing] = useState(false);

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
      ensureImportedFiles(files, 'onedrive');
    } finally {
      setImporting(false);
    }

    onClose();
  };

  const syncOnedrive = async () => {
    try {
      const isConfigured = await isOneDriveConfigured();
      await runOneDriveSync(isConfigured);
      setOnedriveConfigured(isConfigured);
      setOnedriveFiles(await getOneDriveFiles());
      setSyncError('');
    } catch (e) {
      setSyncError((e as Error).toString());
    }
  };

  const handleSelectedFileChange = (selected: any) => {
    if (selected === 'all') {
      setSelectedFile(Array.from(onedriveFiles.keys()));
    } else {
      setSelectedFile(Array.from(selected));
    }
  };

  const load = async () => {
    setIsSyncing(true);
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

  const clear = async () => {
    setIsClearing(true);
    try {
      await clearOneDriveFiles();
      syncOnedrive();
    } catch (e) {
      setSyncError((e as Error).toString());
    } finally {
      setIsClearing(false);
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

              <div className="justify-end flex">
                <Input
                  className="w-[40vh] flex justify-end ml-2"
                  size="sm"
                  placeholder="Enter your document link"
                  value={sharedLink}
                  onChange={(e) => {
                    setSharedLink(e.target.value);
                  }}
                />
                <Button
                  className="ml-2"
                  size="sm"
                  variant="flat"
                  color="primary"
                  isLoading={isSyncing}
                  onClick={load}
                >
                  Load
                </Button>
                <Button
                  className="ml-2"
                  size="sm"
                  color="primary"
                  variant="flat"
                  isLoading={isClearing}
                  onClick={clear}
                >
                  Clear
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-end p-2">
              {syncError && (
                <p className="text-sm text-red-500 ml-2">{syncError}</p>
              )}
            </div>
          </ModalHeader>
          <ModalBody>
            {onedriveConfigured && onedriveFiles.size > 0 && (
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
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              isLoading={importing}
              color="primary"
              size="sm"
              onClick={onClickImport}
            >
              Add to Knowledge
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
