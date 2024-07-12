import { Popover, PopoverTrigger, PopoverContent, Button, Menu, MenuItem } from "@nextui-org/react";
import { deleteThread, renameThread, Thread } from '@/actions/threads';
import { GoPencil, GoTrash, GoKebabHorizontal } from "react-icons/go";

interface NewThreadProps {
    className?: string;
    threadId: string;
    setThreads: React.Dispatch<React.SetStateAction<Thread[]>>;
}

const NewThread = ({ className, threadId, setThreads }: NewThreadProps) => {
    const handleDeleteThread = () => {
        deleteThread(threadId).then(() => {
            setThreads((threads: Thread[]) => threads.filter((thread: Thread) => thread.meta.id !== threadId));
        });
    };

    const handleRenameThread = () => {
        const newName = prompt("Enter a new name for the thread");
        if (newName) {
            renameThread(threadId, newName).then(() => {
                setThreads((threads: Thread[]) => threads.map((thread: Thread) => {
                    if (thread.meta.id === threadId) {
                        return { ...thread, meta: { ...thread.meta, name: newName } };
                    }
                    return thread;
                }));
            });
        }
    }
    
    return (
        <Popover placement="right">
            <PopoverTrigger>
                <Button variant="light" radius="full" className={`${className}`} isIconOnly startContent={<GoKebabHorizontal />}/>
            </PopoverTrigger>
            <PopoverContent className="">
                <Menu aria-label="options">
                    <MenuItem className="py-2" content="Rename" startContent={<GoPencil />} onClick={() => { handleRenameThread() }}>Rename</MenuItem>
                    <MenuItem aria-label="delete" className="py-2" content="Delete" startContent={<GoTrash />} onClick={() => { handleDeleteThread() }}>Delete</MenuItem>
                </Menu>
            </PopoverContent>
        </Popover>
    );
};

export default NewThread;