import { useState } from "react";
import { Tabs, Tab, Card, CardBody, Button } from "@nextui-org/react";
import { IoTerminalOutline, IoFolderOpenOutline } from "react-icons/io5";
import { GoArrowUpRight, GoArrowDownLeft, GoDash } from "react-icons/go";
import { GoTerminal } from "react-icons/go";

import Logs from "./toolbar/logs";

export default function Toolbar() {
    const [collapsed, setCollapsed] = useState(false);
    const [large, setLarge] = useState(false);

    const handleToggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    const handleToggleLarge = () => {
        setLarge(!large);
    }

    const mini = (
        <Button
            onPress={handleToggleCollapse}
            isIconOnly
            radius="full"
            size="lg"
            color="primary"
        >
            <GoTerminal className="text-2xl"/>
        </Button>
    );

    const expanded = (
        <Card className={large ? "w-[70vw] h-[92vh]" : "w-[50vw] h-[25vh]"}>
            <CardBody>
                <Button
                    onPress={handleToggleCollapse}
                    isIconOnly
                    radius="full"
                    size="sm"
                    color="primary"
                    className="absolute right-16"
                >
                    <GoDash className="text-lg"/>
                </Button>
                <Button
                    onPress={handleToggleLarge}
                    isIconOnly
                    radius="full"
                    size="sm"
                    color="primary"
                    className="absolute right-5"
                >
                    { large ? <GoArrowDownLeft className="text-lg"/> : <GoArrowUpRight className="text-lg"/> }
                </Button>
                <Tabs size="lg" color="primary" aria-label="Options">
                    <Tab
                        key="logs"
                        className="overflow-y-scroll"
                        title={
                            <div className="flex items-center space-x-2">
                                <IoTerminalOutline />
                                <span>Logs</span>
                            </div>
                        }
                    >
                        <Logs logs={[
                            { id: 1, message: "Hello, World!", timestamp: "2021-09-01T00:00:00Z" },
                            { id: 2, message: "Goodbye, World!", timestamp: "2021-09-01T00:00:01Z" },
                            { id: 3, message: "Hello, Again!", timestamp: "2021-09-01T00:00:02Z" },
                            { id: 4, message: "Goodbye, Again!", timestamp: "2021-09-01T00:00:03Z"},
                            { id: 5, message: "Hello, World!", timestamp: "2021-09-01T00:00:00Z" },
                            { id: 6, message: "Goodbye, World!", timestamp: "2021-09-01T00:00:01Z" },
                            { id: 7, message: "Hello, Again!", timestamp: "2021-09-01T00:00:02Z" },
                            { id: 8, message: "Goodbye, Again!", timestamp: "2021-09-01T00:00:03Z"},
                        ]}/>
                    </Tab>
                    <Tab
                        key="workspace"
                        title={
                            <div className="flex items-center space-x-2">
                                <IoFolderOpenOutline />
                                <span>Workspace</span>
                            </div>
                        }
                    >
                        <Card>
                            <CardBody>
                                Excepteur sint occaecat cupidatat non proident, sunt in culpa
                                qui officia deserunt mollit anim id est laborum.
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </CardBody>
        </Card>
    );

    return <>{collapsed ? mini : expanded}</>;
}
