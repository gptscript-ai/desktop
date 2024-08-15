import { useEffect, useState, useRef } from 'react';
import { Button, Input } from '@nextui-org/react';
import { GoTrash } from 'react-icons/go';
import { AiOutlineOpenAI } from 'react-icons/ai';
import PropTypes from 'prop-types';

interface ModelsProps {
  options: string[];
  onChange: (value: string | undefined) => void;
  defaultValue?: string;
}

const Models: React.FC<ModelsProps> = ({ options, onChange, defaultValue }) => {
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    defaultValue
  );
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onChange(selectedOption);
  }, [selectedOption]);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowDropdown(true);
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);

    if (selectedValue === 'search') {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) =>
        option.toLowerCase().includes(selectedValue.toLowerCase())
      );
      setFilteredOptions(filtered);
      if (filtered.length === 0) {
        setShowDropdown(false);
      }
    }
  };

  const handleOptionSelect = (option: string) => {
    setShowDropdown(false);
    setSelectedOption(option);
    setShowDropdown(false);
  };

  const handleRemoveValue = () => {
    setFilteredOptions(options);
    setSelectedOption(undefined);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Tab') {
      event.preventDefault();
      setShowDropdown(true);
      if (filteredOptions.length > 0) {
        const currentIndex = filteredOptions.indexOf(selectedOption || '');
        const nextIndex = (currentIndex + 1) % filteredOptions.length;
        setSelectedOption(filteredOptions[nextIndex]);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setShowDropdown(true);
      if (filteredOptions.length > 0) {
        const currentIndex = filteredOptions.indexOf(selectedOption || '');
        const prevIndex =
          (currentIndex - 1 + filteredOptions.length) % filteredOptions.length;
        setSelectedOption(filteredOptions[prevIndex]);
      }
    } else if (event.key === 'Enter') {
      setShowDropdown(false);
      (inputRef.current as HTMLInputElement).blur();
    }
  };

  return (
    <div className="relative">
      <Input
        color="primary"
        label="Model"
        placeholder="Default"
        type="text"
        variant="bordered"
        value={selectedOption || ''}
        onChange={handleOptionChange}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setShowDropdown(false)}
        onKeyDown={handleKeyDown}
        ref={inputRef}
      />
      {selectedOption && (
        <Button
          onPress={handleRemoveValue}
          className="absolute top-1/2 right-2 transform -translate-y-1/2"
          startContent={<GoTrash className="" />}
          variant="light"
          size="sm"
          isIconOnly
        />
      )}
      {showDropdown && filteredOptions.length > 0 && (
        <div className="absolute top-full left-0 z-50 max-h-80 overflow-y-auto rounded-xl bg-white dark:bg-zinc-900 border-1 mt-1 dark:border-zinc-800 w-full shadow-2xl py-2">
          {filteredOptions.map((option, index) => (
            <h1
              aria-label={option}
              key={index}
              role="button"
              onMouseDown={() => handleOptionSelect(option)}
              className={`cursor-pointer flex items-center text-sm p-2 mx-2 my-1 hover:bg-gray-200 dark:hover:bg-zinc-600 rounded-xl ${option === selectedOption ? 'bg-gray-300 dark:bg-zinc-700' : ''}`}
            >
              <AiOutlineOpenAI className="mr-2 text-lg" />
              {option}
            </h1>
          ))}
        </div>
      )}
    </div>
  );
};

Models.propTypes = {
  // @ts-ignore
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  defaultValue: PropTypes.string,
};

export default Models;
