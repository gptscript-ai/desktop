import { Popover, PopoverTrigger, PopoverContent, Button, Menu, MenuItem } from "@nextui-org/react";
import { deleteThread, Thread } from '@/actions/threads';
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

    return (
        <Popover placement="right">
            <PopoverTrigger>
                <Button variant="light" radius="full" className={`${className}`} isIconOnly startContent={<GoKebabHorizontal />}/>
            </PopoverTrigger>
            <PopoverContent className="">
                <Menu>
                    {/* <MenuItem className="py-2" content="Rename" startContent={<GoPencil />} onClick={() => { handleRenameThread() }}>Rename</MenuItem> */}
                    <MenuItem className="py-2" content="Delete" startContent={<GoTrash />} onClick={() => { handleDeleteThread() }}>Delete</MenuItem>
                </Menu>
            </PopoverContent>
        </Popover>
    );
};

export default NewThread;