import {useState} from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
} from "@nextui-org/react";
import {GoTools} from "react-icons/go";
import ToolCatalog from "@/components/edit/configure/imports/toolCatalog";



interface ToolCatalogModalProps {
    tools: string[] | undefined;
    addTool: (tool: string) => void;
    removeTool: (tool: string) => void;
}

const ToolCatalogModal: React.FC<ToolCatalogModalProps> = ({tools, addTool, removeTool}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Button
                className="w-full"
                variant="flat"
                color="primary"
                isIconOnly
                size="sm"
                startContent={<GoTools className="mr-2"/>}
                onPress={() => setIsModalOpen(true)}
            >
                Find tools
            </Button>
            <Modal
                backdrop="blur"
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                size="5xl"
                className="dark:bg-zinc-950 dark:border-2 dark:border-zinc-800"
                scrollBehavior="inside"
                classNames={{base:"w-[95%] max-w-none h-[95%] max-h-none", wrapper: "overflow-hidden"}}
            >
                <ModalContent>
                    <ModalBody>
                        <ToolCatalog
                            tools={tools}
                            addTool={addTool}
                            removeTool={removeTool}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ToolCatalogModal;