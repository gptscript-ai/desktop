import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { BiPlus, BiTrash } from 'react-icons/bi';
import { useContext } from 'react';
import { EditContext } from '@/contexts/edit';

interface KnowledgeProps {
  isFileSettingOpen: boolean;
  onFileSettingClose: () => void;
  isFileTableOpen: boolean;
  onFileTableClose: () => void;
  handleAddFiles: () => void;
}

const KnowledgeModals = ({
  isFileSettingOpen,
  onFileSettingClose,
  isFileTableOpen,
  onFileTableClose,
  handleAddFiles,
}: KnowledgeProps) => {
  const {
    topK,
    setTopK,
    droppedFileDetails,
    setDroppedFileDetails,
    setDroppedFiles,
  } = useContext(EditContext);
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
      <Modal
        size="xl"
        backdrop="opaque"
        isOpen={isFileTableOpen}
        onClose={onFileTableClose}
      >
        <ModalContent>
          <ModalHeader>
            <h3 id="modal-title">Files</h3>
          </ModalHeader>
          <ModalBody>
            <Table removeWrapper aria-label="File table">
              <TableHeader>
                <TableColumn>File Name</TableColumn>
                <TableColumn>Size</TableColumn>
                <TableColumn>{''}</TableColumn>
              </TableHeader>
              <TableBody>
                {Array.from(droppedFileDetails).map((fileDetail, index) => (
                  <TableRow key={index}>
                    <TableCell>{fileDetail[1].fileName}</TableCell>
                    <TableCell>{fileDetail[1].size} KB</TableCell>
                    <TableCell align="right">
                      <Button
                        isIconOnly
                        size="md"
                        onClick={() => {
                          setDroppedFiles((prev) =>
                            prev.filter((f) => f !== fileDetail[0])
                          );
                          const newDetails = new Map(droppedFileDetails);
                          newDetails.delete(fileDetail[0]);
                          setDroppedFileDetails(newDetails);
                        }}
                        className="bg-white"
                        startContent={<BiTrash />}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ModalBody>
          <ModalFooter>
            <Button
              className="w-full"
              onClick={handleAddFiles}
              startContent={<BiPlus />}
            >
              Add files
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default KnowledgeModals;
