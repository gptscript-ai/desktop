import { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { GoUpload, GoFile, GoX } from 'react-icons/go';
import Files from './upload/files';
import { uploadFile, lsFiles } from '@/actions/upload';
import { Dirent } from 'fs';
import Workspace from '@/components/script/chatBar/upload/workspace';
import { ScriptContext } from '@/contexts/script';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
} from '@nextui-org/react';

interface UploadModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const UploadModal = ({ isOpen, setIsOpen }: UploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<Dirent[]>([]);
  const selectedFileRef = useRef(selectedFile);
  const { workspace, restartScript } = useContext(ScriptContext);

  useEffect(() => {
    selectedFileRef.current = selectedFile;
  }, [selectedFile]);
  useEffect(() => fetchFiles(), []);

  const fetchFiles = useCallback(() => {
    lsFiles(workspace)
      .then((data: string) => setFiles(JSON.parse(data) as Dirent[]))
      .catch((error) => console.error('Error fetching files:', error));
  }, [workspace]);

  const handleClose = () => setIsOpen(false);
  const handleCancel = () => setSelectedFile(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedFileRef.current) {
      const formData = new FormData();
      formData.append('file', selectedFileRef.current);
      uploadFile(workspace, formData);
    }
    fetchFiles();
    handleCancel();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    event.preventDefault();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Modal"
      scrollBehavior="inside"
      classNames={{
        base: 'w-[95%] max-w-none h-[95%] max-h-none',
        wrapper: 'overflow-hidden',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col space-y-2">
          <h1>Your workspace</h1>
          <Workspace onRestart={restartScript} />
        </ModalHeader>
        <ModalBody className="max-h-[900px] overflow-y-scroll">
          <Files files={files} setFiles={setFiles} />
          <Divider />
        </ModalBody>
        <ModalFooter>
          <form onSubmit={handleSubmit} className="w-full">
            <input
              disabled={selectedFile != null}
              type="file"
              id="fileUpload"
              name="file"
              hidden
              onChange={handleFileChange}
            />
            <label
              htmlFor="fileUpload"
              className={`
                                flex items-center justify-center w-full drop-shadow-xl rounded-xl p-2 text-center
                                ${selectedFile ? 'text-primary border-2 border-primary' : 'bg-primary cursor-pointer text-white'}
                            `}
            >
              <GoFile className="mr-4" />
              {selectedFile ? selectedFile.name : 'Add a new file'}
            </label>
            {selectedFile && (
              <div className="flex space-x-4 my-4">
                <Button
                  startContent={<GoUpload />}
                  color="primary"
                  className="w-1/2"
                  type="submit"
                >
                  Upload
                </Button>
                <Button
                  startContent={<GoX />}
                  color="danger"
                  className="w-1/2"
                  onPress={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UploadModal;
