import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { GoCheckCircle } from 'react-icons/go';
import type { PromptFrame, PromptResponse } from '@gptscript-ai/gptscript';
import { Input, Button } from '@nextui-org/react';

const PromptForm = ({
  frame,
  onSubmit,
}: {
  frame: PromptFrame;
  onSubmit: (data: PromptResponse) => void;
}) => {
  const { register, handleSubmit, getValues } =
    useForm<Record<string, string>>();
  const [submitted, setSubmitted] = useState(false);

  const noFields = !frame.fields || frame.fields.length === 0;
  if (noFields) {
    frame.fields = [];
  }

  const onSubmitForm = () => {
    setSubmitted(true);
    onSubmit({ id: frame.id, responses: getValues() });
    if (frame.metadata && frame.metadata.authURL) {
      open(frame.metadata.authURL);
    }
  };

  let buttonText = noFields ? 'OK' : 'Submit';
  let includeHiddenInput = false;
  if (noFields && frame.metadata && frame.metadata.authURL) {
    buttonText = 'Click here to sign in';
    includeHiddenInput = true;
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="mx-4">
      {frame.fields.map(
        (field, index) =>
          field && (
            <Input
              key={index}
              {...register(field)}
              label={field.charAt(0).toUpperCase() + field.slice(1)} // Capitalize the field name
              className="mb-6"
              variant="underlined"
              type={frame.sensitive ? 'password' : 'text'}
            />
          )
      )}
      {includeHiddenInput && (
        <Input
          type="text"
          className="hidden"
          {...register('handled')}
          value={'true'}
        />
      )}
      <Button
        startContent={<GoCheckCircle />}
        type="submit"
        className="mb-6 w-full"
        size="lg"
        color="primary"
        isDisabled={submitted}
      >
        {submitted ? 'Submitted' : buttonText}
      </Button>
    </form>
  );
};

export default PromptForm;
