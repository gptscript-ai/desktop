import { useState } from 'react';
import StackTrace from './calls/stackTrace';
import type { CallFrame } from '@gptscript-ai/gptscript';
import { IoCloseSharp } from 'react-icons/io5';
import { BsArrowsFullscreen } from 'react-icons/bs';
import { HiOutlineArrowsPointingIn } from 'react-icons/hi2';
import { GoProjectRoadmap } from 'react-icons/go';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Tooltip,
} from '@nextui-org/react';
import SaveFile from '@/components/saveFile';

const Calls = ({ calls }: { calls: Record<string, CallFrame> }) => {
  const [showModal, setShowModal] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div>
      <Tooltip content="View stack trace" closeDelay={0.5}>
        <Button
          onPress={() => setShowModal(true)}
          isIconOnly
          radius="full"
          variant="flat"
          color="primary"
        >
          <GoProjectRoadmap />
        </Button>
      </Tooltip>
      <Modal
        isOpen={showModal}
        onOpenChange={setShowModal}
        hideCloseButton={true}
        size={fullscreen ? 'full' : '3xl'}
        className={fullscreen ? '' : 'h-4/5'}
      >
        <ModalContent>
          <ModalHeader className="flex justify-between">
            <div>
              <div className="my-2">
                <h1 className="text-2xl  inline mr-2">Stack Trace</h1>
                <SaveFile content={calls} />
              </div>
              <h2 className="text-base text-zinc-500">
                Below you can see what this call is doing or has done.
              </h2>
            </div>
            <div>
              <Button
                radius="full"
                size="sm"
                isIconOnly
                color="primary"
                onPress={(_) => setShowModal(false)}
              >
                <IoCloseSharp />
              </Button>
              <Button
                radius="full"
                size="sm"
                isIconOnly
                color="primary"
                className="ml-2"
                onPress={(_) => setFullscreen(!fullscreen)}
              >
                {fullscreen ? (
                  <HiOutlineArrowsPointingIn className="text-lg" />
                ) : (
                  <BsArrowsFullscreen />
                )}
              </Button>
            </div>
          </ModalHeader>
          <ModalBody className="mb-4 h-full overflow-y-scroll">
            <StackTrace calls={calls} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Calls;
