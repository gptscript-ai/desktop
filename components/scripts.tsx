"use client";

import React, {useState, useEffect, useCallback, useContext} from "react";
import {VscNewFile} from "react-icons/vsc";
import {GoTrash, GoPaperAirplane, GoPencil, GoPerson} from "react-icons/go";
import Loading from "@/components/loading";
import {getScripts, deleteScript, ParsedScript} from '@/actions/me/scripts';
import {AuthContext} from "@/contexts/auth";
import {
    Card,
    CardHeader,
    CardBody,
    Button,
} from "@nextui-org/react";
import { LuMessageSquare } from "react-icons/lu";

export default function Scripts() {
    const [scripts, setScripts] = useState<ParsedScript[]>([]);
    const [loading, setLoading] = useState(true);
    const {authenticated, me} = useContext(AuthContext);

    const refresh = () => {
        getScripts({owner: me?.username})
            .then((resp) => setScripts(resp.scripts || []))
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    }

    const handleDelete = useCallback((script: ParsedScript) => {
        deleteScript(script)
            .then(() => {
                setScripts((scripts) => scripts.filter((currScript) => currScript.id !== script.id));
            })
            .catch((error) => console.error(error));
    }, []);

    useEffect(() => { refresh() }, [authenticated, me]);

    const ScriptItems = () => authenticated ? (
        <div className="grid grid-cols-2 gap-6">
            <div className="grid grid-cols-1 gap-4 col-span-2">
                <Button
                    size="lg"
                    startContent={<VscNewFile/>}
                    color="primary"
                    variant="flat"
                    onPress={() => {
                        {
                            window.location.href = '/edit'
                        }
                    }}
                >
                    Create a new assistant
                </Button>
            </div>
            {!loading && !scripts.length &&
                <Card className="col-span-2 p-4 text-center">
                    <CardBody className="flex gap-3">
                        Create a new assistant with the button above to get started!
                    </CardBody>
                </Card>
            }
            {scripts.map((script) => (
                <Card key={script.agentName ? script.agentName : script.displayName} className="p-4">
                    <CardHeader className="flex justify-between">
                        <div className="flex gap-3 items-center">
                            <GoPerson className="mb-1 text-xl bg-gray-100 dark:bg-zinc-700 rounded-full text-primary-500 h-8 w-8 p-1.5"/>
                            {script.agentName ? script.agentName : script.displayName}
                        </div>
                        <div className="flex-col flex absolute bottom-1 right-4">
                            <Button startContent={<GoPaperAirplane />} onPress={() => {
                                window.location.href = `/?file=${script.publicURL}&id=${script.id}`;
                            }} radius="full" variant="light" isIconOnly/>
                            { me?.username === script.owner && <Button startContent={<GoPencil />} onPress={() => {
                                window.location.href = `/edit?file=${script.publicURL}&id=${script.id}`;
                            }} radius="full" variant="light" isIconOnly/>}
                            { me?.username === script.owner && <Button startContent={<GoTrash />} onPress={() => {
                                handleDelete(script)
                            }} radius="full" variant="light" isIconOnly/> }
                        </div>
                    </CardHeader>
                    <CardBody>
                        <p className="truncate w-4/5 text-zinc-500">{script.description ? script.description : "No description provided"}</p>
                    </CardBody>
                </Card>
            ))}
        </div>
    ) : (
        <Card>
            <CardBody className="flex items-center h-full my-10">
                <p>Login to create your own files!</p>
            </CardBody>
        </Card>
    );

    return (
        <div>
            {loading ?
                <div className="h-[50vh]"><Loading/></div> :
                <ScriptItems/>
            }
        </div>
    );
}
