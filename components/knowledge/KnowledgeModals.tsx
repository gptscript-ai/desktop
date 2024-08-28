import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Slider,
} from '@nextui-org/react';
import { useContext } from 'react';
import { EditContext } from '@/contexts/edit';

interface KnowledgeProps {
  isFileSettingOpen: boolean;
  onFileSettingClose: () => void;
}

const KnowledgeModals = ({
  isFileSettingOpen,
  onFileSettingClose,
}: KnowledgeProps) => {
  const { topK, setTopK } = useContext(EditContext);
  return (
    <>
      <Modal
        size="sm"
        backdrop="opaque"
        isOpen={isFileSettingOpen}
        onClose={onFileSettingClose}
      >
        <ModalContent>
          <ModalHeader>Settings</ModalHeader>
          <ModalBody>
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">{`Number of Results:`}</p>
              <p className="text-sm text-zinc-500">{topK}</p>
            </div>
            <Slider
              size="sm"
              step={1}
              value={topK}
              minValue={0}
              maxValue={50}
              onChange={(value) => {
                setTopK(value as number);
              }}
              aria-label="top-k"
            />
            <p className="text-sm text-zinc-500 pt-2">
              Select the number of most relevant documents from a retrieved set,
              based on their relevance scores
            </p>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default KnowledgeModals;
