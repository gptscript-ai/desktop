import React, { useState, useEffect} from "react";
import { GoCheckCircle, GoXCircle, GoCheckCircleFill} from "react-icons/go";
import type { AuthResponse } from "@gptscript-ai/gptscript";
import { Button, Tooltip } from "@nextui-org/react";

type ConfirmFormProps = {
    id: string;
    onSubmit: (data: AuthResponse) => void;
    tool: string;
    addTrusted: () => void;
};


const ConfirmForm = ({ id, onSubmit, tool, addTrusted}: ConfirmFormProps) => {
    const [loading, setLoading] = useState(false);

    useEffect(() => { setLoading(false) }, [id]);
    
    const onSubmitForm = (accept: boolean) => {
        setLoading(true);
        onSubmit({ id, message: `denied by user`, accept })
    };

    return (
        <form className="mx-2 mt-4">
            <div className="flex justify-between">
                <Tooltip content="Allow this command to be executed" closeDelay={0.5} placement="top">
                    <Button
                        startContent={!loading && <GoCheckCircle />}
                        onClick={() => onSubmitForm(true)}
                        className="mb-6 w-1/2 mr-2"
                        size="lg"
                        color="primary"
                        isLoading={loading}
                    >
                        Allow
                    </Button>
                </Tooltip>
                <Tooltip content="Allow all future command runs from this tool" closeDelay={0.5} placement="top">
                    <Button
                        startContent={!loading && <GoCheckCircleFill />}
                        onClick={() => {
                            addTrusted()
                            onSubmitForm(true)
                        }}
                        className="mb-6 w-1/2 ml-2"
                        size="lg"
                        isLoading={loading}
                    >
                        Allow All
                    </Button>
                </Tooltip>
                <Button
                    startContent={!loading && <GoXCircle />}
                    onClick={() => onSubmitForm(false)}
                    className="mb-6 w-1/2 ml-2"
                    size="lg"
                    isLoading={loading}
                >
                    Deny
                </Button>
               
            </div>
        </form>
    );
};

export default ConfirmForm;