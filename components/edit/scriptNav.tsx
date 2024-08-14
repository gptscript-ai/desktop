import React, {useState, useEffect, useContext} from "react";
import {fetchScripts} from "@/actions/scripts/fetch";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, Button} from "@nextui-org/react";
import {IoMenu} from "react-icons/io5";
import {FaCopy, FaRegFileCode} from "react-icons/fa";
import {VscNewFile} from "react-icons/vsc";
import {GoCode, GoCopy, GoPerson, GoSidebarCollapse, GoSidebarExpand} from "react-icons/go";
import {ParsedScript, getScripts} from "@/actions/me/scripts";
import { EditContext } from "@/contexts/edit";
import { PiExport } from "react-icons/pi";
import { AuthContext } from "@/contexts/auth";
import { stringify } from "@/actions/gptscript";

interface ScriptNavProps {
    className?: string;
    collapsed: boolean;
    setCollapsed?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ScriptNav: React.FC<ScriptNavProps> = ({className, collapsed, setCollapsed}) => {
    const [scripts, setScripts] = useState<ParsedScript[]>([]);
    const {script, loading} = useContext(EditContext);
    const {me} = useContext(AuthContext);

    useEffect(() => {
        if (!me) return;
        getScripts({owner: me?.username})
            .then(resp => setScripts(resp.scripts || []))
            .catch(error => console.error(error));
    }, [me]);

    const ScriptItems = scripts && scripts.length ?
        scripts.map((script, i) => (
            <DropdownItem startContent={<GoPerson className="mb-1"/>} key={script.publicURL}>{script.agentName || `Untitled Assistant ${i}`}</DropdownItem>
        )) :
        <DropdownItem key={'no-files'} isReadOnly>No files found</DropdownItem>;

    return (
        <Dropdown className="w-[300px] max-h-[70vh] overflow-y-auto">
            <DropdownTrigger>
                <Button size="lg" variant="solid" color="primary" isIconOnly radius="full" className={loading ? 'hidden' : 'flex'}>
                    <IoMenu/>
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="edit"
                onAction={(key) => {
                    if (key === 'collapse') {
                        setCollapsed && setCollapsed(!collapsed);
                    } else if (key === 'export') {
                        stringify(script).then((gptscript) => {
                            navigator.clipboard.writeText(gptscript);
                        });
                    } else {
                        window.location.href = `/edit?file=${key}`;
                    }
                }}
                disabledKeys={['no-files']}
            >
                <DropdownItem showDivider startContent={collapsed ? <GoSidebarCollapse/> : <GoSidebarExpand/> } key="collapse">
                    {collapsed ? 'Expand' : 'Collapse'} editor
                </DropdownItem>
                <DropdownSection title="Actions" showDivider>
                    <DropdownItem startContent={<VscNewFile/>} key="new">
                        New assistant
                    </DropdownItem>
                    <DropdownItem startContent={<FaCopy/>} key="export">
                        Copy assistant to clipboard
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection title="My Assistants">
                    {ScriptItems}
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    );
}

export default ScriptNav
