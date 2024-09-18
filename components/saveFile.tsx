import { Button, Tooltip } from '@nextui-org/react';
import React from 'react';
import { GoDownload } from 'react-icons/go';

interface SaveFileProps {
  content: any; // any javascript object
  className?: string;
}

const SaveFile: React.FC<SaveFileProps> = ({ content, className }) => {
  const handleSave = () => {
    window.electronAPI.saveFile(JSON.stringify(content, null, 2));
  };

  return (
    <Tooltip content={'Download Call Frames'} closeDelay={0}>
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
