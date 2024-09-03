import { useCallback, useState } from 'react';
import { Button, Modal, ModalBody, ModalContent } from '@nextui-org/react';
import { GoTools } from 'react-icons/go';
import ToolCatalog from '@/components/edit/configure/imports/toolCatalog';
import PropTypes from 'prop-types';
import { parse } from '@/actions/gptscript';

interface ToolCatalogModalProps {
  tools: string[] | undefined;
  addTool: (tool: string) => void;
}

const ToolCatalogModal: React.FC<ToolCatalogModalProps> = ({
  tools,
  addTool,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addToolAndClose = useCallback(
    async (tool: string) => {
      await parse(tool);
      addTool(tool);
      setIsModalOpen(false);
    },
    [addTool, setIsModalOpen]
  );

  return (
    <>
      <Button
        className="w-full"
        variant="flat"
        color="primary"
        isIconOnly
        size="sm"
        startContent={<GoTools className="mr-2" />}
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
        classNames={{
          base: 'w-[95%] max-w-none h-[95%] max-h-none',
          wrapper: 'overflow-hidden',
        }}
      >
        <ModalContent>
          <ModalBody>
            <ToolCatalog tools={tools} addTool={addToolAndClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

ToolCatalogModal.propTypes = {
  // @ts-ignore
  tools: PropTypes.arrayOf(PropTypes.string).isRequired,
  addTool: PropTypes.func.isRequired,
};

export default ToolCatalogModal;
