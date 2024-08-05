import React, {useState, useEffect} from "react";
import {fetchScripts} from "@/actions/scripts/fetch";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, Button} from "@nextui-org/react";
import {IoMenu} from "react-icons/io5";
import {FaRegFileCode} from "react-icons/fa";
import {VscNewFile} from "react-icons/vsc";
import {GoSidebarCollapse, GoSidebarExpand} from "react-icons/go";
import {Script, getScripts} from "@/actions/me/scripts";

interface ScriptNavProps {
    className?: string;
    collapsed: boolean;
    setCollapsed?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ScriptNav: React.FC<ScriptNavProps> = ({className, collapsed, setCollapsed}) => {
    const [scripts, setScripts] = useState<Script[]>([]);

    useEffect(() => {
        getScripts()
            .then(resp => setScripts(resp.scripts || []))
            .catch(error => console.error(error));
    }, []);

    const ScriptItems = scripts && scripts.length ? scripts.map((script) => (
        <DropdownItem startContent={<FaRegFileCode/>} key={script.publicURL}>{script.displayName}</DropdownItem>
    )) : <DropdownItem key={'no-files'} isReadOnly>No files found</DropdownItem>;

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button size="lg" variant="solid" color="primary" isIconOnly radius="full">
                    <IoMenu/>
                </Button>
            </DropdownTrigger>
            <DropdownMenu 
                aria-label="edit" 
                onAction={(key) => { 
                    if (key === 'collapse') {
                        setCollapsed && setCollapsed(!collapsed);
                    } else {
                        window.location.href = `/edit?file=${key}`;
                    }
                }}
                disabledKeys={['no-files']}
            >
                <DropdownSection title="Actions" showDivider>
                    <DropdownItem startContent={collapsed ? <GoSidebarCollapse/> : <GoSidebarExpand/> } key="collapse">
                        {collapsed ? 'Expand' : 'Collapse'} editor
                    </DropdownItem>
                    <DropdownItem startContent={<VscNewFile/>} key="new">
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

export default ScriptNav