import {
  Avatar,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
} from '@nextui-org/react';
import { BiPlus } from 'react-icons/bi';
import { NotionFileModal } from '@/components/knowledge/Notion';
import { isNotionConfigured, runNotionSync } from '@/actions/knowledge/notion';
import { useState } from 'react';
import { OnedriveFileModal } from '@/components/knowledge/OneDrive';
import {
  isOneDriveConfigured,
  runOneDriveSync,
} from '@/actions/knowledge/onedrive';

interface FileModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleAddFile: () => void;
}

const FileModal = ({ isOpen, onClose, handleAddFile }: FileModalProps) => {
  const notionModal = useDisclosure();
  const onedriveModal = useDisclosure();
  const [isSyncing, setIsSyncing] = useState(false);
  const [notionConfigured, setNotionConfigured] = useState(false);
  const [notionSyncError, setNotionSyncError] = useState('');
  const [oneDriveConfigured, setOneDriveConfigured] = useState(false);
  const [oneDriveSyncError, setOneDriveSyncError] = useState('');

  const onClickNotion = async () => {
    onClose();
    notionModal.onOpen();
    const isConfigured = await isNotionConfigured();
    if (!isConfigured) {
      setIsSyncing(true);
      try {
        await runNotionSync(false);
        setNotionConfigured(true);
      } catch (e) {
        setNotionSyncError((e as Error).toString());
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const onClickOnedrive = async () => {
    onClose();
    onedriveModal.onOpen();
    const isConfigured = await isOneDriveConfigured();
    if (!isConfigured) {
      setIsSyncing(true);
      try {
        await runOneDriveSync(false);
        setOneDriveConfigured(true);
      } catch (e) {
        setOneDriveSyncError((e as Error).toString());
      } finally {
        setIsSyncing(false);
      }
    } else {
      setOneDriveConfigured(true);
    }
  };

  return (
    <>
      <Modal
        closeButton
        aria-labelledby="modal-title"
        isOpen={isOpen}
        onClose={onClose}
        hideCloseButton={true}
      >
        <ModalContent className="p-4">
          <ModalBody>
            <Button
              onClick={() => {
                handleAddFile();
                onClose();
              }}
              className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent hover:cursor-pointer"
            >
              <BiPlus className="h-5 w-5" />
              <span className="text-sm font-semibold leading-6">
                Add Local Files
              </span>
            </Button>

            <Button
              onClick={onClickNotion}
              className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent hover:cursor-pointer"
            >
              <Avatar
                size="sm"
                src="notion.svg"
                alt="Notion Icon"
                classNames={{ base: 'p-1.5 bg-white' }}
              />
              <span className="text-sm font-semibold leading-6">
                Sync From Notion
              </span>
            </Button>
            <Button
              onClick={onClickOnedrive}
              className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent hover:cursor-pointer"
            >
              <Avatar
                size="sm"
                src="onedrive.svg"
                alt="OneDrive Icon"
                classNames={{ base: 'p-1.5 bg-white' }}
              />
              <span className="text-sm font-semibold leading-6">
                Sync From OneDrive
              </span>
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
      <NotionFileModal
        isOpen={notionModal.isOpen}
        onClose={notionModal.onClose}
        notionConfigured={notionConfigured}
        setNotionConfigured={setNotionConfigured}
        syncError={notionSyncError}
      />
      <OnedriveFileModal
        isOpen={onedriveModal.isOpen}
        onClose={onedriveModal.onClose}
        isSyncing={isSyncing}
        setIsSyncing={setIsSyncing}
        onedriveConfigured={oneDriveConfigured}
        setOnedriveConfigured={setOneDriveConfigured}
        syncError={oneDriveSyncError}
        setSyncError={setOneDriveSyncError}
      />
    </>
  );
};

export default FileModal;
