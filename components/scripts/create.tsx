import React from "react";
import {Popover, PopoverTrigger, PopoverContent, Button, Input} from "@nextui-org/react";
import { VscNewFile } from "react-icons/vsc";
import { GoPaperAirplane } from "react-icons/go";
import { createScript, getNewScriptName, getScript } from "@/actions/me/scripts";

const newDefaultAssistant = (name: string): string => {
    return `
Name: ${name}
Chat: true

You are a helpful assistant named ${name}.
`
}

export default function Create() {
    const handleSubmit = async (e: any) => {
        getNewScriptName()
            .then((name) => {
                createScript({
                    displayName: name,
                    visibility: 'public',
                    content: newDefaultAssistant(name),
                }).then((script) => {
                    getScript(`${script.id}`)
                        .then((script) =>
                            window.location.href = `/edit?file=${script.publicURL}&id=${script.id}`
                        );
                })
            })
    };

  
    return (
        <Button
            size="lg"
            startContent={<VscNewFile/>}
            color="primary"
            variant="solid"
            onPress={handleSubmit}
        >
            Create a new assistant
        </Button>
    );
}
