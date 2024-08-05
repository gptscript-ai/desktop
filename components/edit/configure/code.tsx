import Editor from "@monaco-editor/react";
import {useEffect, useState} from "react";
import {Button} from "@nextui-org/button";
import {BsArrowsFullscreen} from "react-icons/bs";
import { Divider, Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react";
import {useTheme} from "next-themes";

export enum Language {
    Javascript = "javascript",
    Python = "python",
    Bash = "shell",
}

interface CodeProps {
    code: string;
    onChange: (value: string) => void;
    label?: string;
}

const Code = ({code, onChange, label = "Code"}: CodeProps) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [language, setLanguage] = useState<Language>(Language.Javascript);
    const {theme, setTheme} = useTheme();

    return (
        <div className="border-2 dark:border-zinc-700 rounded-xl">
            <div className="flex justify-between items-center pr-2">
                <div className="flex">
                    {label && 
                        <>
                            <p className="text-primary-500 font-medium pl-3 text-tiny">{label}</p>
                            <Divider orientation="vertical" className="h-4 ml-2"/>
                        </>
                    }
                    <select className="pl-2 dark:bg-black text-tiny capitalize" 
                        onChange={((e) => {setLanguage(e.target.value as Language)})}
                    >
                        <option>{Language.Javascript}</option>
                        <option>{Language.Python}</option>
                        <option>{Language.Bash}</option>
                    </select>                
                </div>
                <Button 
                    startContent={<BsArrowsFullscreen/>}
                    isIconOnly size="sm"
                    radius="full"
                    variant="light"
                    onPress={() => setIsFullscreen(true)}
                />
            </div>
            <div className="pb-1 border-t-1 dark:border-t-zinc-700">
                <Editor
                    height="35vh"
                    language={language}
                    theme={theme === "dark" ? "hc-black" : "vs-light"}
                    value={code}
                    onChange={(code) => {onChange(code || '')}}
                    options={{
                        inlineSuggest: { enabled: true },
                        formatOnType: true,
                        padding: { top: 10},
                        minimap: { enabled: false },
                    }}
                />
            </div>

            <Modal
                isOpen={isFullscreen}
                onOpenChange={setIsFullscreen}
                classNames={{base:"w-[95%] max-w-none h-[95%] max-h-none border-2 dark:border-zinc-700", wrapper: "overflow-hidden", body: "p-0"}}
            >
                <ModalContent>
                    <ModalHeader>
                        <h1 className="">You're writing in 
                            <select className="text-primary dark:bg-zinc-900 capitalize" 
                                value={language}
                                onChange={((e) => {setLanguage(e.target.value as Language)})}
                            >
                                <option>{Language.Javascript}</option>
                                <option>{Language.Python}</option>
                                <option>{Language.Bash}</option>
                            </select>
                        </h1>
                    </ModalHeader>
                    <ModalBody className="border-t-1 dark:border-zinc-700 w-full">
                        <Editor
                            height="100%"
                            width="100%"
                            language={language}
                            theme={theme === "dark" ? "hc-black" : "vs-light"}
                            value={code}
                            onChange={(code) => {onChange(code || '')}}
                            options={{
                                inlineSuggest: { enabled: true },
                                formatOnType: true,
                                padding: { top: 20},
                                minimap: { enabled: false },
                            }}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
}
export default Code;