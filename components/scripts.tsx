"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaRegFileCode } from "react-icons/fa";
import { VscNewFile } from "react-icons/vsc";
import { GoTrash, GoPaperAirplane, GoPencil} from "react-icons/go";
import Loading from "@/components/loading";
import { fetchScripts } from "@/actions/scripts/fetch";
import {
    Card,
    CardHeader,
    CardBody,
    Button,
} from "@nextui-org/react";

export default function Scripts({buildOptions}: {buildOptions?: boolean}) {
    const [files, setFiles] = useState<Record<string,string>>({});
    const [loading, setLoading] = useState(true);

    const deleteFile = useCallback((file: string) => {
        fetch(`/api/file/${file}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    const newFiles = { ...files };
                    delete newFiles[file+ ".gpt"];
                    setFiles(newFiles);
                }
            })
            .catch((error) => console.error(error))
    }, [files]);

    useEffect(() => {
        fetchScripts()
            .then((files) => setFiles(files))
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    }, []);

    const ScriptItems = () => files && Object.keys(files) ? (
        <div className="grid grid-cols-2 gap-6">
            { buildOptions &&
                <Button
                    size="lg"
                    startContent={<VscNewFile/>}
                    color="primary"
                    className="col-span-2"
                    onPress={() => {{ window.location.href = '/edit'}}}
                >
                    Create a new script
                </Button>
            }
            { !loading && Object.keys(files).length === 0 && 
                <Card className="col-span-2 p-4 text-center">
                    <CardHeader>
                        <h1 className="font-bold">No scripts found</h1>
                    </CardHeader>
                    <CardBody className="flex gap-3">
                        Create a new script in the folder you started the UI in to see it here!
                    </CardBody>
                </Card>
            }
            {Object.keys(files).map((file) => (
                <Card key={file.replace(".gpt", "")} className="p-4">
                    <CardHeader className="flex justify-between">
                        <div className="flex gap-3 items-center">
                            <FaRegFileCode />
                            {file.replace('.gpt', '')}
                        </div>
                        { buildOptions ? 
                            <div className="flex-col flex absolute bottom-1 right-4">
                                <Button startContent={<GoPaperAirplane />} onPress={() => {{ window.location.href = `/run?file=${file.replace('.gpt', '')}`;}}} radius="full" variant="light" isIconOnly/>
                                <Button startContent={<GoPencil />} onPress={() => {{ window.location.href = `/edit?file=${file.replace('.gpt', '')}`;}}} radius="full" variant="light" isIconOnly/>
                                <Button startContent={<GoTrash />} onPress={() => {deleteFile(file.replace('.gpt', ''))}}radius="full" variant="light" isIconOnly/>
                            </div> :
                            <div className="absolute right-4 top-10">
                                <Button startContent={<GoPaperAirplane />} onPress={() => {{ window.location.href = `/run?file=${file.replace('.gpt', '')}`;}}} radius="full" variant="light" size="lg" isIconOnly/>    
                            </div>
                        }
                    </CardHeader>
                    <CardBody>
                        <p className="truncate w-4/5 text-zinc-500">{files[file] ? files[file] : "No description provided"}</p>
                    </CardBody>
                </Card>
            ))}
        </div>
    ) : (
        <Card>
            <CardBody className="flex gap-3">
                <p>No files found</p>
            </CardBody>
        </Card>
    );

    return (
        <div>
            {loading ? 
                <div className="h-[50vh]"><Loading/></div>:
                <ScriptItems />
            }
        </div>
    );
}
