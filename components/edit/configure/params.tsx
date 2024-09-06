import { useState } from 'react';
import { Property } from '@gptscript-ai/gptscript';
import { Input, Button } from '@nextui-org/react';
import { GoPlus, GoTrash } from 'react-icons/go';

interface ExternalProps {
  params: Record<string, Property> | undefined;
  setParams: (params: Record<string, Property>) => void;
  className?: string;
}

const Imports: React.FC<ExternalProps> = ({ params, setParams, className }) => {
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState<string>('');
  const [inputDescription, setInputDescription] = useState<string>('');

  const handleDeleteParam = (param: string) => {
    const updatedParams = { ...params };
    delete updatedParams[param];
    setParams(updatedParams);
  };

  const handleAddParam = () => {
    if (params && Object.keys(params)?.includes(input)) {
      setError(`Parameter ${input} already exists`);
      return;
    }
    if (!input) {
      setError('Parameter cannot be empty');
      return;
    }
    setParams({
      ...(params || {}),
      [input]: { type: 'string', description: inputDescription },
    });
    setInput('');
    setInputDescription('');
  };

  const handleCreateDefaultParam = () => {
    let defaultParamName = 'New Param';
    let counter = 1;
    while (params && Object.keys(params)?.includes(defaultParamName)) {
      defaultParamName = `New Param ${counter}`;
      counter++;
    }

    if (params && Object.keys(params)?.includes(defaultParamName)) {
      setError(`Parameter ${defaultParamName} already exists`);
      return;
    }

    setParams({
      ...(params || {}),
      [defaultParamName]: { type: 'string', description: '' },
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {params &&
        Object.keys(params).map((param) => (
          <div key={param} className="flex space-x-2">
            <Input
              color="primary"
              size="sm"
              placeholder="Name..."
              className="w-3/4 2xl:w-1/4"
              variant="bordered"
              defaultValue={param}
              onBlur={(e) => {
                const target = e.target as HTMLInputElement;
                const updatedParams = { ...params };
                delete updatedParams[param];
                updatedParams[target.value] = params[param];
                setParams(updatedParams);
              }}
            />
            <Input
              color="primary"
              size="sm"
              placeholder="Description..."
              variant="bordered"
              value={params[param].description}
              onChange={(e) => {
                setParams({
                  ...params,
                  [param]: {
                    ...params[param],
                    description: e.target.value,
                  },
                });
              }}
            />
            <Button
              variant="bordered"
              size="sm"
              onClick={() => handleDeleteParam(param)}
              isIconOnly
              startContent={<GoTrash />}
            />
          </div>
        ))}
      <div className="flex space-x-2 mt-2">
        <Button
          variant="flat"
          color="primary"
          className="w-full"
          size="sm"
          onClick={handleCreateDefaultParam}
          isIconOnly
          startContent={<GoPlus />}
        />
      </div>
    </div>
  );
};

export default Imports;
