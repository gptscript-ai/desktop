import { useState, useEffect, useContext } from "react";
import { FaWrench } from "react-icons/fa";
import { IoIosChatboxes } from "react-icons/io";
import {
    Textarea,
    Slider,
    Switch,
    Tooltip,
} from "@nextui-org/react";;
import ArgsTable from "../argsTable";
import { ToolContext } from "../tool";

const Custom = () => {
    const {data, isChat, setIsChat, description, setDescription, temperature, setTemperature} = useContext(ToolContext);

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex space-x-4">
                <Tooltip
                    color="primary"
                    closeDelay={0}
                    content="Toggle the ability to chat with this tool"
                    showArrow={true}
                >
                    <div className="h-full my-auto">
                        <Switch
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
                className="max-w-md"
                onChange={(e) => setTemperature(e as number)}
            />
        </div>
    );
};

export default Custom;