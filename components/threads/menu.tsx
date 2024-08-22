import { useState, useContext } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Menu,
  MenuItem,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
} from '@nextui-org/react';
import { deleteThread, renameThread, Thread } from '@/actions/threads';
import { GoPencil, GoTrash, GoKebabHorizontal } from 'react-icons/go';
import { ScriptContext } from '@/contexts/script';
import { Input } from '@nextui-org/input';

interface NewThreadProps {
  className?: string;
  thread: string;
}

const NewThread = ({ className, thread }: NewThreadProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setThreads } = useContext(ScriptContext);
  const [threadNameInput, setThreadNameInput] = useState('');

  const handleDeleteThread = () => {
    deleteThread(thread).then(() => {
      setThreads((threads: Thread[]) =>
        threads.filter((t: Thread) => t.meta.id !== thread)
      );
    });
  };

  const handleRenameThread = (newName: string) => {
    if (newName) {
      renameThread(thread, newName).then(() => {
        setThreads((threads: Thread[]) =>
          threads.map((t: Thread) => {
            if (t.meta.id === thread) {
              return { ...t, meta: { ...t.meta, name: newName } };
            }
            return t;
          })
        );
      });
    }
  };

  return (
    <>
      <Popover
        placement="right-start"
        isOpen={isPopoverOpen}
        onOpenChange={(open) => setIsPopoverOpen(open)}
      >
        <PopoverTrigger>
          <Button
            variant="light"
            radius="full"
            className={`${className}`}
            isIconOnly
            startContent={<GoKebabHorizontal />}
          />
        </PopoverTrigger>
        <PopoverContent className="">
          <Menu aria-label="options">
            <MenuItem
              className="py-2"
              content="Rename"
              startContent={<GoPencil />}
              onClick={() => {
                setIsPopoverOpen(false);
                onOpen();
              }}
            >
              Rename
            </MenuItem>
            <MenuItem
              aria-label="delete"
              className="py-2"
              content="Delete"
              startContent={<GoTrash />}
              onClick={() => {
                setIsPopoverOpen(false);
                handleDeleteThread();
              }}
            >
              Delete
            </MenuItem>
          </Menu>
        </PopoverContent>
      </Popover>
      <Modal
        backdrop={'opaque'}
        isOpen={isOpen}
        onClose={onClose}
        placement="top-center"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Rename thread
          </ModalHeader>
          <ModalBody>
            <Input
              aria-label="rename"
              label="New Name"
              value={threadNameInput}
              onChange={(e) => setThreadNameInput(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              aria-label="rename"
              color="primary"
              onPress={() => {
                handleRenameThread(threadNameInput);
                onClose();
              }}
            >
              Rename
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NewThread;
