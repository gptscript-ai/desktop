import {useState, useContext} from "react";
import {Popover, PopoverTrigger, PopoverContent, Button, Menu, MenuItem} from "@nextui-org/react";
import {deleteThread, renameThread, Thread} from '@/actions/threads';
import {GoPencil, GoTrash, GoKebabHorizontal} from "react-icons/go";
import {ScriptContext} from '@/contexts/script';

interface NewThreadProps {
    className?: string;
    thread: string;
}

const NewThread = ({className, thread}: NewThreadProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const {
        setThreads,
    } = useContext(ScriptContext);

    const handleDeleteThread = () => {
        deleteThread(thread).then(() => {
            setThreads((threads: Thread[]) => threads.filter((t: Thread) => t.meta.id !== thread));
        });
    };

    const handleRenameThread = () => {
        const newName = prompt("Enter a new name for the thread");
        if (newName) {
            renameThread(thread, newName).then(() => {
                setThreads((threads: Thread[]) => threads.map((t: Thread) => {
                    if (t.meta.id === thread) {
                        return { ...t, meta: { ...t.meta, name: newName } };
                    }
                    return t;
                }));
            });
        }
    }

    return (
        <Popover placement="right" isOpen={isOpen} onOpenChange={(open) => setIsOpen(open)}>
            <PopoverTrigger>
                <Button variant="light" radius="full" className={`${className}`} isIconOnly
                        startContent={<GoKebabHorizontal/>}/>
            </PopoverTrigger>
            <PopoverContent className="">
                <Menu aria-label="options">
                    <MenuItem className="py-2" content="Rename" startContent={<GoPencil/>} onClick={() => {
                        setIsOpen(false);
                        handleRenameThread()
                    }}>Rename</MenuItem>
                    <MenuItem aria-label="delete" className="py-2" content="Delete" startContent={<GoTrash/>}
                              onClick={() => {
                                  setIsOpen(false);
                                  handleDeleteThread()
                              }}>Delete</MenuItem>
                </Menu>
            </PopoverContent>
        </Popover>
    );
};

export default NewThread;