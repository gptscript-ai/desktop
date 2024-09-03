'use client';

import { Button } from '@nextui-org/button';
import {
  Modal,
  ModalContent,
  Input,
  ModalHeader,
  ModalBody,
  Spinner,
  Link,
} from '@nextui-org/react';
import { useEffect, useState } from 'react';

export function UrlToolModal({
  isOpen,
  onAddTool,
  onClose,
  error,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddTool: (tool: string) => void;
  error?: string;
  isLoading?: boolean;
}) {
  const [toolUrl, setToolUrl] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setToolUrl('');
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Add Tool from URL</ModalHeader>

        <ModalBody className="flex flex-col pb-6">
          <form
            className="flex flex-col gap-2 items-center"
            onSubmit={(e) => {
              e.preventDefault();
              onAddTool(toolUrl);
              setToolUrl('');
            }}
          >
            <Input
              label="Tool Url"
              errorMessage={error}
              isInvalid={!!error}
              variant="bordered"
              color={error ? 'danger' : 'primary'}
              name="toolUrl"
              value={toolUrl}
              onChange={(e) => setToolUrl(e.target.value)}
              placeholder="example: github.com/gptscript-ai/vision"
            />
            <Button
              fullWidth
              type="submit"
              variant="flat"
              color="primary"
              disabled={isLoading}
              endContent={isLoading ? <Spinner size="sm" /> : undefined}
            >
              Add Tool
            </Button>
          </form>

          <p>
            Find more tools in our{' '}
            <Link isExternal href="https://tools.gptscript.ai/">
              Community Catalog
            </Link>
          </p>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
