import { useState, useEffect} from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button } from '@nextui-org/react';
import { CiMenuKebab } from "react-icons/ci";


interface SidebarProps {
    className?: string;
    onChangeFile: (file: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ className, onChangeFile }) => {
    const [files, setFiles] = useState<Record<string,string>>({});
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/file")
            .then((response) => {
                let files = {};
                if (response.status === 200) files = response.json();
                return files
            })
            .then((files: Record<string, string>) => setFiles(files))
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    }, []);

    const handleFileSelection = (file: string) => {
        setSelectedFile(file);
        onChangeFile(file);
    };

    return (
        <Card 
            shadow="none"
            className={`m-4 p-4 transition-all duration-300 ${className} border dark:border-slate-700 dark:bg-opacity-0`}
        >
            <CardBody className="flex flex-col space-y-2">
                { loading && <p>Loading...</p> }
                { !loading && Object.keys(files).length === 0 && <p>No scripts found</p> }
                { !loading && Object.keys(files).map((file) => (
                    <div className="flex space-x-2 items-center">
                        <Button
                            className="w-full"
                            key={file}
                            variant={selectedFile === file ? "solid" : "bordered"}
                            onPress={() => handleFileSelection(file)}
                        >
                            {file}
                        </Button>
                        <Button
                            isIconOnly
                            variant="light"
                            radius="full"
                            size="sm"
                        >
                            <CiMenuKebab/>
                        </Button>
                    </div>
                ))}
            </CardBody>
        </Card>
    );
};

export default Sidebar;