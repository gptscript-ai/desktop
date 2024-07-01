import { useState, useRef, useEffect } from 'react';
import { GoFileDirectory, GoUpload, GoFile, GoX } from 'react-icons/go';
import Files from './upload/files';
import { uploadFile, lsWorkspaceFiles } from '@/actions/upload';
import { Dirent } from 'fs';
import Workspace from '@/components/script/chatBar/upload/workspace';
import { 
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Tooltip,
    ScrollShadow,
    Divider,
} from '@nextui-org/react';

interface UploadModalProps {
    onRestart: () => void;
    disabled: boolean;
}

const UploadModal = ({onRestart, disabled}: UploadModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [files, setFiles] = useState<Dirent[]>([]);
    const selectedFileRef = useRef(selectedFile);

    useEffect(() => { selectedFileRef.current = selectedFile }, [selectedFile]);
    useEffect(() => fetchFiles(), []);

    const fetchFiles = () => {
        lsWorkspaceFiles()
            .then((data: string) => setFiles(JSON.parse(data) as Dirent[]))
            .catch((error) => console.error('Error fetching files:', error));
    }

    const handleOpen = () => setIsOpen(true)
    const handleClose = () => setIsOpen(false);
    const handleCancel = () => setSelectedFile(null);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (selectedFileRef.current) {
            const formData = new FormData();
            formData.append('file', selectedFileRef.current);
            uploadFile(formData);
        }
        fetchFiles();
        handleCancel();
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setSelectedFile(file);
        event.preventDefault();
    };

    return (
        <>
            <Tooltip content="View and manage your workspace" closeDelay={0.5} placement="top">
                <Button
                    isDisabled={disabled}
                    startContent={<GoFileDirectory />}
                    isIconOnly
                    radius="full"
                    className="mr-2 my-auto text-xl"
                    color="primary"
                    onPress={handleOpen}
                />
            </Tooltip>
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                title="Upload Modal"
                size="3xl"
                className="h-3/4"
            >
                <ModalContent>
                    <ModalHeader>
                        <h1>Your workspace</h1>
                    </ModalHeader>
                    <ModalBody className="max-h-[900px] overflow-y-scroll">
                        <Workspace onRestart={onRestart}/>
                        <ScrollShadow>
                            <Files files={files} setFiles={setFiles} />
                        </ScrollShadow>
                        <Divider />
                    </ModalBody>
                    <ModalFooter>
                        <form onSubmit={handleSubmit} className="w-full">
                            <input disabled={selectedFile != null} type="file" id="fileUpload" name="file" hidden onChange={handleFileChange} />
                            <label 
                                htmlFor="fileUpload"
                                className={`
                                    flex items-center justify-center w-full drop-shadow-xl rounded-xl p-2 text-center
                                    ${selectedFile ? 'text-primary border-2' : 'border-white border-2 bg-primary cursor-pointer text-white'}
                                `}
                            >
                                <GoFile className="mr-4"/>
                                {selectedFile ? selectedFile.name : 'Add a new file'}
                            </label>
                            { selectedFile &&
                                <div className="flex space-x-4 my-4">
                                    <Button startContent={<GoUpload />} color="primary" className="w-1/2" type="submit">Upload</Button>
                                    <Button startContent={<GoX />}  color="danger" className="w-1/2" onPress={handleCancel}>Cancel</Button>
                                </div>
                            }
                        </form>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default UploadModal;