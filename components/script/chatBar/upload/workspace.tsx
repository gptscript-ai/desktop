import {useState, useCallback, useContext, useEffect} from 'react';
import {ScriptContext} from '@/contexts/script';
import { 
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
} from '@nextui-org/react';
import { updateThreadWorkspace } from '@/actions/threads';

interface WorkspaceProps {
    onRestart: () => void;
}

const Workspace = ({onRestart}: WorkspaceProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const {workspace, setWorkspace, thread} = useContext(ScriptContext);
    const [workspaceInput, setWorkspaceInput] = useState<string>('');

    useEffect(() => {
        setWorkspaceInput(workspace)
    }, [workspace]);

    const handleOpen = () => setIsOpen(true)
    const handleClose = () => setIsOpen(false);
    const handleConfirm = useCallback(() => {
        setWorkspace(workspaceInput);
        setIsOpen(false);
        updateThreadWorkspace(thread, workspaceInput);
        onRestart();
    }, [workspaceInput]);

    return (
        <div className="flex w-full space-x-4">
            <Input
                spellCheck={false}
                color="primary"
                variant="bordered"
                placeholder="Set your workspace folder..."
                label="Workspace folder"
                value={workspaceInput}
                onKeyDown={(event) => event.key === 'Enter' && workspaceInput != workspace && handleConfirm()}
                onChange={(event) => setWorkspaceInput(event.target.value) }
            />
            { workspace != workspaceInput &&
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