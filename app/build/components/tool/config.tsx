import { useContext } from "react";
import { FaWrench } from "react-icons/fa";
import { IoIosChatboxes } from "react-icons/io";
import {
    Textarea,
    Slider,
    Input,
    Switch,
    Card,
    CardHeader,
    CardBody,
    Button,
    Divider,
    Accordion,
    AccordionItem,
} from "@nextui-org/react";
import Context from "./config/context";
import { ToolContext } from "../tool";
import { subtitle } from "@/components/primitives";
import { BuildContext } from "@/app/build/page";
import { IoCloseSharp } from "react-icons/io5";

const Custom = () => {
    const { 
        name,
        isChat, setIsChat, 
        description, setDescription, 
        temperature, setTemperature, 
        jsonResponse, setJsonResponse,
        internalPrompt, setInternalPrompt,
        modelName, setModelName,
        maxTokens, setMaxTokens,
    } = useContext(ToolContext);
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
                <Accordion variant="splitted" defaultExpandedKeys={["basic","parameters"]} selectionMode="multiple">
                    <AccordionItem key="basic" aria-label="Basic" title="Basic" subtitle="Define core behavior">
                        <div className="px-2 flex flex-col space-y-6 mb-6">
                            <Switch
                                className="h-full"
                                isSelected={isChat}
                                onValueChange={setIsChat}
                                thumbIcon={({ isSelected, className }) =>
                                    isSelected ? (
                                        <IoIosChatboxes className={className} />
                                    ) : (
                                        <FaWrench className={className} />
                                    )
                                }
                            >
                                Toggle Chat
                            </Switch>

                            <Textarea
                                fullWidth
                                label="Description"
                                placeholder="Describe your tool..."
                                defaultValue={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </AccordionItem>
                    <AccordionItem key="context" aria-label="Contexts" title="Contexts" subtitle="Add contexts from a file or tool">
                        <div className="mb-6 px-2" >
                            <Context />
                        </div>
                    </AccordionItem>
                    <AccordionItem key="advanced" aria-label="Advanced" title="Advanced" subtitle="Tweak advanced configuration for this tool">
                        <div className="px-2 flex flex-col space-y-6 mb-6">
                            <Switch isSelected={jsonResponse} onValueChange={setJsonResponse}>JSON Response</Switch>
                            <Switch isSelected={internalPrompt} onValueChange={setInternalPrompt}>Internal Prompt</Switch>
                            <Input defaultValue={modelName} onChange={(e) => setModelName(e.target.value)} label="Model name"/>
                            <Input type="number" defaultValue={`${maxTokens}`} onChange={(e) => setMaxTokens(parseInt(e.target.value))} label="Max tokens"/>
                            <Slider
                                label="Creativity"
                                step={0.01}
                                maxValue={1}
                                minValue={0}
                                defaultValue={temperature}
                                onChange={(e) => setTemperature(e as number)}
                            />
                        </div>
                    </AccordionItem>
                </Accordion>
            </CardBody>
        </Card>
    );
};

export default Custom;