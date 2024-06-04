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
    const onSubmitForm = (accept: boolean) => onSubmit({ id, message: `denied by user`, accept });

    return (
        <form className="mx-2 mt-4">
            <div className="flex justify-between">
                <Tooltip content="Allow this command to be executed" closeDelay={0.5} placement="top">
                    <Button
                        startContent={<GoCheckCircle />}
                        onClick={() => onSubmitForm(true)}
                        className="mb-6 w-1/2 mr-2"
                        size="lg"
                        color="primary"
                    >
                        Allow
                    </Button>
                </Tooltip>
                <Tooltip content="Allow all future command runs from this tool" closeDelay={0.5} placement="top">
                    <Button
                        startContent={<GoCheckCircleFill />}
                        onClick={() => {
                            addTrusted()
                            onSubmitForm(true)
                        }}
                        className="mb-6 w-1/2 ml-2"
                        size="lg"
                    >
                        Allow All
                    </Button>
                </Tooltip>
                <Button
                    startContent={<GoXCircle />}
                    onClick={() => onSubmitForm(false)}
                    className="mb-6 w-1/2 ml-2"
                    size="lg"
                >
                    Deny
                </Button>
               
            </div>
        </form>
    );
};

export default ConfirmForm;