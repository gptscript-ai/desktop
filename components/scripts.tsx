"use client";

import React, {useState, useEffect, useCallback, useContext} from "react";
import {GoTrash, GoPencil} from "react-icons/go";
import Loading from "@/components/loading";
import {getScripts, deleteScript, ParsedScript} from '@/actions/me/scripts';
import {AuthContext} from "@/contexts/auth";
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    CardFooter,
    Avatar,
    Divider,
    ScrollShadow,
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

    const abbreviate = (name: string) => {
        const words = name.split(/(?=[A-Z])|[\s_-]/);
        const firstLetters = words.map(word => word[0]);
        return firstLetters.slice(0, 2).join('').toUpperCase();
    }

    useEffect(() => { refresh() }, [authenticated, me]);

    const ScriptItems = () => authenticated ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 4xl:grid-cols-4 w-full gap-10">
            {scripts.map((script) => (
                <Card key={script.agentName ? script.agentName : script.displayName} className="p-4 h-[350px]">
                    <CardHeader className="w-full grid grid-cols-1">
                        <div className="flex justify-between">
                            <div className="flex gap-3 items-center">
                                <h1 className="text-2xl truncate mb-6">{script.agentName ? script.agentName : script.displayName}</h1>
                            </div>
                        </div>
                        <Divider />
                    </CardHeader>
                    <CardBody className="overflow-y-auto">
                        <ScrollShadow size={8}>
                            <p className="max-w-full max-h-full text-zinc-500">{script.description ? script.description : "No description provided."}</p>
                        </ScrollShadow>
                    </CardBody>
                    <CardFooter className="flex justify-between space-x-2">
                        <Button
                            className="w-full"
                            startContent={<LuMessageSquare />}
                            color="primary"
                            variant="flat"
                            onPress={() => {
                                window.location.href = `/?file=${script.publicURL}&id=${script.id}`;
                            }}
                        >
                            Chat
                        </Button>
                        { me?.username === script.owner && 
                            <>
                                <Button
                                    className="w-full"
                                    variant="flat"
                                    color="primary"
                                    startContent={<GoPencil />}
                                    onPress={() => {
                                        window.location.href = `/edit?file=${script.publicURL}&id=${script.id}`;
                                    }}
                                >
                                    Edit
                                </Button>
                                <Button
                                    className="w-full"
                                    startContent={<GoTrash />}
                                    variant="flat"
                                    onPress={() => {
                                        handleDelete(script)
                                    }}
                                >
                                    Delete
                                </Button>
                                    
                            </>
                        }
                    </CardFooter>
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
