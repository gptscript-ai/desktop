"use client";

import React, {useState, useEffect, useCallback, useContext} from "react";
import {FaRegFileCode} from "react-icons/fa";
import {VscNewFile} from "react-icons/vsc";
import {GoTrash, GoPaperAirplane, GoPencil} from "react-icons/go";
import Loading from "@/components/loading";
import {getScripts, deleteScript, ParsedScript} from '@/actions/me/scripts';
import {AuthContext} from "@/contexts/auth";
import {
    Card,
    CardHeader,
    CardBody,
    Button,
} from "@nextui-org/react";

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
            <Button
                size="lg"
                startContent={<VscNewFile/>}
                color="primary"
                className="col-span-2"
                onPress={() => {
                    {
                        window.location.href = '/edit'
                    }
                }}
            >
                Create a new script
            </Button>
            {!loading && !scripts.length &&
                <Card className="col-span-2 p-4 text-center">
                    <CardBody className="flex gap-3">
                        Create a new script with the button above to get started!
                    </CardBody>
                </Card>
            }
            {scripts.map((script) => (
                <Card key={script.agentName ? script.agentName : script.displayName} className="p-4">
                    <CardHeader className="flex justify-between">
                        <div className="flex gap-3 items-center">
                            <FaRegFileCode />
                            {script.agentName ? script.agentName : script.displayName}
                        </div>
                        <div className="flex-col flex absolute bottom-1 right-4">
                            <Button startContent={<GoPaperAirplane />} onPress={() => {
                                window.location.href = `/run?file=${script.publicURL}&id=${script.id}`;
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
