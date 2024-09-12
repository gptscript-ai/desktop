import { Button, Tooltip } from '@nextui-org/react';
import React from 'react';
import { GoDownload } from 'react-icons/go';

interface Props {
  content: any; // any javascript object
  className?: string;
}

const SaveFile: React.FC<Props> = ({ content, className }) => {
  const handleSave = () => {
    window.electronAPI.saveFile(JSON.stringify(content, null, 2));
  };

  return (
    <Tooltip content={'Download Stack Trace'} closeDelay={0}>
      <Button
        size="sm"
        onPress={handleSave}
        className={className}
        isIconOnly
        radius="full"
        startContent={<GoDownload />}
      />
    </Tooltip>
  );
};

export default SaveFile;
