import React, { useState, useEffect } from "react";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, Button} from "@nextui-org/react";
import { IoMenu } from "react-icons/io5";
import { FaRegFileCode } from "react-icons/fa";
import { VscNewFile } from "react-icons/vsc";

export default function App() {
    const [files, setFiles] = useState<Record<string, string>>({});

    useEffect(() => {
        fetch('http://localhost:3000/api/file')
            .then(response => response.json())
            .then(data => setFiles(data))
            .catch(error => console.error(error));
    }, []);

    const ScriptItems = files && Object.keys(files).length ? Object.keys(files).map((file) => (
        <DropdownItem startContent={<FaRegFileCode/>} key={file.replace('.gpt', '')}>{file}</DropdownItem>
    )) : <DropdownItem key={'no-files'} isReadOnly>No files found</DropdownItem>;

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button size="lg" variant="shadow" color="primary" isIconOnly radius="full">
                    <IoMenu />
                </Button>
            </DropdownTrigger>
            <DropdownMenu 
                aria-label="Action event example" 
                onAction={(key) => { window.location.href = `/build?file=${key}`;}}
            >
                <DropdownSection title="Actions" showDivider>
                    <DropdownItem startContent={<VscNewFile />} key="new">
                        New script
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection title="Scripts">
                    {ScriptItems}
                </DropdownSection>
               
            </DropdownMenu>
        </Dropdown>
    );
}
