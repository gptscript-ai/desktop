import React from "react";
import {Popover, PopoverTrigger, PopoverContent, Button, Input} from "@nextui-org/react";
import { VscNewFile } from "react-icons/vsc";
import { GoPaperAirplane } from "react-icons/go";

export default function Create() {
  return (
    <Popover placement="top" showArrow offset={10} backdrop="blur">
        <PopoverTrigger>
                <Button
                    size="lg"
                    startContent={<VscNewFile/>}
                    color="primary"
                    variant="solid"
                    onPress={() => {}}
                >
                    Create a new assistant
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px]">
            <div className="px-1 py-2 w-full flex space-x-2">
                <Input placeholder="Give your assistant a name..." size="lg" variant="bordered" color="primary"/>
                <Button isIconOnly startContent={<GoPaperAirplane/>} radius="full" variant="flat" color="primary" size="lg"/>
            </div>
        </PopoverContent>
    </Popover>
  );
}
