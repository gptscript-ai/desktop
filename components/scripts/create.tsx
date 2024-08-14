import React from "react";
import {Popover, PopoverTrigger, PopoverContent, Button, Input} from "@nextui-org/react";
import { VscNewFile } from "react-icons/vsc";
import { GoPaperAirplane, GoPersonAdd } from "react-icons/go";
import { createScript, getScript } from "@/actions/me/scripts";

const newDefaultAssistant = (name: string): string => {
    return `
Name: ${name}
Chat: true

You are a helpful assistant named ${name}. When you first start, just introduce yourself and wait for the user's next message.
`
}

export default function Create() {
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async () => {
        const defaultName = "New Assistant";
        const slug = defaultName.toLowerCase().replace(" ", "-") + "-" + Math.random().toString(36).substring(2, 7);
        createScript({
            displayName: defaultName,
            slug,
            visibility: "private",
            content: newDefaultAssistant(defaultName),
        }).then((script) => {
            getScript(`${script.id}`)
                .then((script) =>
                    window.location.href = `/edit?file=${script?.publicURL}&id=${script?.id}`
                );
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
