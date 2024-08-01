import { useEffect, useState, useRef, useContext } from 'react';
import { Button, Input } from '@nextui-org/react';
import { GoTrash } from 'react-icons/go';
import { EditContext, ToolType } from '@/contexts/edit';

interface ModelsProps {
    options: string[];
    onChange: (value: string | undefined) => void;
    onEnter: () => void;
    defaultValue?: string;
    toolType: ToolType;
}

const Models: React.FC<ModelsProps> = ({ options, onChange, onEnter, defaultValue, toolType }) => {
    const [selectedOption, setSelectedOption] = useState<string | undefined>(defaultValue);
    const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const { addNewTool } = useContext(EditContext);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        onChange(selectedOption);
    }, [selectedOption]);

    const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowDropdown(true);
        const selectedValue = event.target.value;
        setSelectedOption(selectedValue);

        const filtered = options.filter(option =>
            option.toLowerCase().includes(selectedValue.toLowerCase())
        );
        if (filtered.length === 0) {
            setShowDropdown(false);
        }
        setFilteredOptions(filtered);
    };

    const handleOptionSelect = (option: string) => {
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
                const prevIndex = (currentIndex - 1 + filteredOptions.length) % filteredOptions.length;
                setSelectedOption(filteredOptions[prevIndex]);
            }
        } else if (event.key === 'Enter') {
            setShowDropdown(false);
            (inputRef.current as HTMLInputElement).blur();
            onEnter();
        }
    };

    return (
        <div className="relative w-full">
            <Input
                className="w-full"
                color="primary"
                placeholder="Select a local or remote tool..."
                type="text"
                variant="bordered"
                size="sm"
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
                <div 
                    className="absolute top-full left-0 z-40 max-h-80 overflow-y-auto px-2 rounded-xl mt-1 bg-white dark:bg-zinc-900 border-1 w-full shadow-2xl py-2"
                    onFocus={()=>{setShowDropdown(true)}}
                >
                    <Button
                        radius="md"
                        color="primary"
                        size="sm"
                        className="w-full z-50"
                        onPress={()=> { addNewTool(toolType); setShowDropdown(false)}}
                    >
                        Create new local tool
                    </Button>
                    {filteredOptions.map((option, index) => (
                        <h1
                            aria-label={option}
                            key={index}
                            role="button"
                            onMouseDown={() => handleOptionSelect(option)}
                            className={`cursor-pointer text-sm p-2 my-1 hover:bg-gray-200 dark:hover:bg-zinc-600 rounded-xl 
                                ${
                                    option === selectedOption ? 'bg-gray-300 dark:bg-zinc-700' : ''
                                }
                            `}
                        >
                            {option}
                        </h1>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Models;
