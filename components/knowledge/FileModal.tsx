import {
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
} from '@nextui-org/react';
import { Image } from '@nextui-org/image';
import { BiPlus } from 'react-icons/bi';
import { NotionFileModal } from '@/components/knowledge/Notion';
import { isNotionConfigured, runNotionSync } from '@/actions/knowledge/notion';
import { useState } from 'react';

interface FileModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleAddFile: () => void;
}

const FileModal = ({ isOpen, onClose, handleAddFile }: FileModalProps) => {
  const notionModal = useDisclosure();
  const [isSyncing, setIsSyncing] = useState(false);
  const [notionConfigured, setNotionConfigured] = useState(false);

  const onClickNotion = async () => {
    onClose();
    notionModal.onOpen();
    const isConfigured = await isNotionConfigured();
    if (!isConfigured) {
      setIsSyncing(true);
      await runNotionSync(false);
      setIsSyncing(false);
      setNotionConfigured(true);
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
            <div
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
            </div>

            <div
              onClick={onClickNotion}
              className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent hover:cursor-pointer"
            >
              <Image className="h-5 w-5" src="notion.svg" alt="Notion Icon" />
              <span className="text-sm font-semibold leading-6">
                Sync From Notion
              </span>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
      <NotionFileModal
        isOpen={notionModal.isOpen}
        onClose={notionModal.onClose}
        isSyncing={isSyncing}
        setIsSyncing={setIsSyncing}
        notionConfigured={notionConfigured}
        setNotionConfigured={setNotionConfigured}
      />
    </>
  );
};

export default FileModal;
