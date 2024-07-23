import {useState, useCallback, useRef, useEffect} from 'react';
import {getWorkspaceDir, setWorkspaceDir} from '@/actions/workspace';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
} from '@nextui-org/react';

interface WorkspaceProps {
    onRestart: () => void;
}

const Workspace = ({onRestart}: WorkspaceProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [workspace, setWorkspace] = useState<string>('');
    const [actingWorkspace, setActingWorkspace] = useState<string>('');

    useEffect(() => {
        getWorkspaceDir().then((wd) => setActingWorkspace(wd))
    }, []);

    useEffect(() => {
        setWorkspace(actingWorkspace)
    }, [actingWorkspace]);

    const handleOpen = () => setIsOpen(true)
    const handleClose = () => setIsOpen(false);
    const handleConfirm = useCallback(() => {
        setWorkspaceDir(workspace);
        setIsOpen(false);
        onRestart();
    }, [workspace]);

    return (
        <div className="flex w-full space-x-4">
            <Input
                color="primary"
                variant="bordered"
                placeholder="Set your workspace folder..."
                label="Workspace folder"
                value={workspace}
                onKeyDown={(event) => event.key === 'Enter' && actingWorkspace != workspace && handleConfirm()}
                onChange={(event) => setWorkspace(event.target.value)}
            />
            {workspace != actingWorkspace &&
                <Button
                    className="absolute right-8 mt-2"
                    color="danger"
                    onPress={handleOpen}
                >
                    Update
                </Button>
            }
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                backdrop='blur'
                title="Upload Modal"
                size="xl"
            >
                <ModalContent>
                    <ModalHeader>
                        <h1>Are you sure?</h1>
                    </ModalHeader>
                    <ModalBody className="max-h-[900px] overflow-y-scroll">
                        <p>Changing the workspace for this script requires it to restart.</p>
                    </ModalBody>
                    <ModalFooter className="flex justify-between">
                        <Button
                            color="danger"
                            className="w-1/2"
                            onPress={handleConfirm}
                        >
                            Confirm and restart
                        </Button>
                        <Button
                            color="primary"
                            className="w-1/2"
                            onPress={handleClose}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default Workspace;