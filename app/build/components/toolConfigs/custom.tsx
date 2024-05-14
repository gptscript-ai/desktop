import { useContext } from "react";
import { FaWrench } from "react-icons/fa";
import { IoIosChatboxes } from "react-icons/io";
import {
    Textarea,
    Slider,
    Switch,
    Tooltip,
    Card,
    CardHeader,
    CardBody,
    Button,
    Divider,
} from "@nextui-org/react";;
import ArgsTable from "../argsTable";
import { ToolContext } from "../tool";
import { subtitle } from "@/components/primitives";
import { BuildContext } from "@/app/build/page";
import { IoCloseSharp } from "react-icons/io5";

const Custom = () => {
    const {data, isChat, setIsChat, description, setDescription, temperature, setTemperature, name} = useContext(ToolContext);
    const {setConfigPanel} = useContext(BuildContext);
    return (
        <Card className="h-full">
            <CardHeader className="px-4 py-2">
                <div className="w-full flex justify-between">
                    <h1 className={subtitle()}>
                        Configuration for <span className="capitalize font-bold text-primary">{name}</span>
                    </h1>
                    <Button
                        radius="full"
                        isIconOnly
                        color="primary"
                        onPress={(_) => setConfigPanel(<></>)}
                    >
                        <IoCloseSharp />
                    </Button>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="flex flex-col space-y-6 p-6 h-full overflow-y-scroll">
                <div className="flex space-x-4">
                    <Tooltip
                        color="primary"
                        closeDelay={0}
                        content="Toggle the ability to chat with this tool"
                    >
                        <div>
                            <Switch
                                className="h-full"
                                size="lg"
                                isSelected={isChat}
                                onValueChange={setIsChat}
                                thumbIcon={({ isSelected, className }) =>
                                    isSelected ? (
                                        <IoIosChatboxes className={className} />
                                    ) : (
                                        <FaWrench className={className} />
                                    )
                                }
                            />
                        </div>
                    </Tooltip>
                </div>

                <Textarea
                    fullWidth
                    label="Description"
                    placeholder="Describe your tool..."
                    defaultValue={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <ArgsTable args={data.arguments?.properties} />

                <Slider
                    label="Creativity"
                    step={0.01}
                    maxValue={1}
                    minValue={0}
                    defaultValue={temperature}
                    onChange={(e) => setTemperature(e as number)}
                />
            </CardBody>
        </Card>
    );
};

export default Custom;