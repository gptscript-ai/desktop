import React from "react";
import {Popover, PopoverTrigger, PopoverContent, Button, Input} from "@nextui-org/react";
import { VscNewFile } from "react-icons/vsc";
import { GoPaperAirplane, GoPersonAdd } from "react-icons/go";
import { createScript, getNewScriptName, getScript } from "@/actions/me/scripts";

const newDefaultAssistant = (name: string): string => {
    return `
Name: ${name}
Chat: true

You are a helpful assistant named ${name}.
`
}

export default function Create() {
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async () => {
        getNewScriptName()
            .then((name) => {
                createScript({
                    displayName: name,
                    visibility: "private",
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
            isLoading={loading}
            size="md"
            startContent={loading ? null: <GoPersonAdd />}
            color="primary"
            variant="flat"
            onPress={() => {
                setLoading(true);
                handleSubmit();
            }}
        >
            Create a new assistant
        </Button>
    );
}
