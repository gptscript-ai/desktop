import React, { useState, useEffect } from 'react';
import { GoCheckCircle, GoXCircle, GoCheckCircleFill } from 'react-icons/go';
import type { AuthResponse } from '@gptscript-ai/gptscript';
import { Button, Code, Tooltip } from '@nextui-org/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ConfirmFormProps = {
  id: string;
  tool: string;
  message?: string;
  command?: string;
  onSubmit: (data: AuthResponse) => void;
  addTrusted: () => void;
};

const ConfirmForm = ({
  id,
  onSubmit,
  tool,
  addTrusted,
  message,
  command,
}: ConfirmFormProps) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [id]);

  const onSubmitForm = (accept: boolean) => {
    setLoading(true);
    onSubmit({ id, message: `denied by user`, accept });
  };

  if (loading) {
    return null;
  }

  return (
    <form>
      <Markdown
        className="!text-wrap prose overflow-x-auto dark:prose-invert p-4 !w-full !max-w-full prose-thead:text-left prose-img:rounded-xl prose-img:shadow-lg"
        remarkPlugins={[remarkGfm]}
      >
        {message}
      </Markdown>
      {command && (
        <Code className="ml-4 whitespace-pre-wrap">
          {command.startsWith('Running')
            ? command.replace('Running', '').replace(/`/g, '')
            : command.replace(/`/g, '')}
        </Code>
      )}
      <div className="flex justify-between mt-4 mx-4">
        <Tooltip
          content="Allow this command to be executed"
          closeDelay={0.5}
          placement="top"
        >
          <Button
            startContent={<GoCheckCircle />}
            onClick={() => onSubmitForm(true)}
            className="mb-6 w-1/2 mr-2"
            size="lg"
            color="primary"
          >
            Allow
          </Button>
        </Tooltip>
        <Tooltip
          content="Allow all future command runs from this tool"
          closeDelay={0.5}
          placement="top"
        >
          <Button
            startContent={<GoCheckCircleFill />}
            onClick={() => {
              addTrusted();
              onSubmitForm(true);
            }}
            className="mb-6 w-1/2 ml-2"
            size="lg"
          >
            Allow All
          </Button>
        </Tooltip>
        <Button
          startContent={<GoXCircle />}
          onClick={() => onSubmitForm(false)}
          className="mb-6 w-1/2 ml-2"
          size="lg"
        >
          Deny
        </Button>
      </div>
    </form>
  );
};

export default ConfirmForm;
