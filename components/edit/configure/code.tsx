import Editor from "@monaco-editor/react";
import {useEffect, useState} from "react";
import {Button} from "@nextui-org/button";
import {BsArrowsFullscreen} from "react-icons/bs";
import { Divider, Modal, ModalBody, ModalContent, ModalHeader, Tab, Tabs } from "@nextui-org/react";
import {useTheme} from "next-themes";

export enum Language {
    Node = "node",
    Python = "python",
    Bash = "bash",
    Prompt = "prompt",
}

const LanguageSyntax = {
    [Language.Node]: "javascript",
    [Language.Python]: "python",
    [Language.Bash]: "shell",
    [Language.Prompt]: "plaintext",

}

const LanguageDependencyFileSyntax = {
    [Language.Node]: "json",
    [Language.Python]: "",
    [Language.Bash]: "",
    [Language.Prompt]: "",
}

interface CodeProps {
    code: string;
    onChange: (value: string) => void;
    dependencies: string;
    onDependenciesChange: (content: string, type: string) => void;
}

const Code = ({code, onChange, dependencies, onDependenciesChange}: CodeProps) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [language, setLanguage] = useState<Language>(Language.Node);
    const {theme, setTheme} = useTheme();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as Language);

        const langFile = languageDependencyFile(e.target.value as Language); 
        if (!langFile) {
            onDependenciesChange("", "");
        } else {
            onDependenciesChange(dependencies, langFile);
        }

        const codeLines = code.split("\n");
        if (e.target.value === Language.Prompt) {
            codeLines.shift();
            onChange(codeLines.join("\n"));
            return;
        }
        
        if (codeLines && codeLines[0] && !codeLines[0].startsWith("#!")) {
            codeLines.unshift(`#!${e.target.value}`);
        } else {
            codeLines[0] = `#!${e.target.value}`;
        }

        onChange(codeLines.join("\n"));
    }

    const languageDependencyFile = (lang: Language) => {
        switch (lang) {
            case Language.Node:
                return "package.json";
            case Language.Python:
                return "requirements.txt";
            default:
                return "";
        }
    }

    useEffect(() => {
        if(code.startsWith("#!node")) {
            setLanguage(Language.Node)
        } else if(code.startsWith("#!python")) {
            setLanguage(Language.Python)
        } else if(code.startsWith("#!bash")) {
            setLanguage(Language.Bash)
        } else {
            setLanguage(Language.Prompt)
        }
    }, [code])

    return (
        <>
            {/* CODE EDITOR*/}
            <Tabs color="primary" variant="underlined">
                <Tab title="Code">
                    <div className="border-2 dark:border-zinc-700 rounded-xl">
                        <div className="flex justify-between items-center pr-2">
                            <div className="flex">
                                <select className="pl-2 dark:bg-black text-tiny capitalize"
                                    value={language.toString()}
                                    onChange={handleLanguageChange}
                                >
                                    <option>{Language.Node}</option>
                                    <option>{Language.Python}</option>
                                    <option>{Language.Bash}</option>
                                    <option>{Language.Prompt}</option>
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
                                language={LanguageSyntax[language]}
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
                                            value={language.toString()}
                                            onChange={((e) => {setLanguage(e.target.value as Language)})}
                                        >
                                            <option>{Language.Node}</option>
                                            <option>{Language.Python}</option>
                                            <option>{Language.Bash}</option>
                                        </select>
                                    </h1>
                                </ModalHeader>
                                <ModalBody className="border-t-1 dark:border-zinc-700 w-full">
                                    <Editor
                                        height="100%"
                                        width="100%"
                                        language={LanguageSyntax[language]}
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
                </Tab>

                {/* DEPENDENCIES EDITOR */}
                {languageDependencyFile(language) && (
                    <Tab title="Dependencies">
                        <div className="border-2 dark:border-zinc-700 rounded-xl">
                            <div className="flex justify-between items-center pr-2">
                                <div className="flex">
                                    <p className="pl-3 dark:bg-black text-tiny italic">
                                        {languageDependencyFile(language)}         
                                    </p>
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
                                    language={LanguageDependencyFileSyntax[language]}
                                    theme={theme === "dark" ? "hc-black" : "vs-light"}
                                    value={dependencies}
                                    onChange={(code) => {onDependenciesChange(code || '', languageDependencyFile(language))}}
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
                                                value={language.toString()}
                                                onChange={((e) => {setLanguage(e.target.value as Language)})}
                                            >
                                                <option>{Language.Node}</option>
                                                <option>{Language.Python}</option>
                                                <option>{Language.Bash}</option>
                                            </select>
                                        </h1>
                                    </ModalHeader>
                                    <ModalBody className="border-t-1 dark:border-zinc-700 w-full">
                                        <Editor
                                            height="100%"
                                            width="100%"
                                            language={LanguageDependencyFileSyntax[language]}
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
                    </Tab>
                )}
                
            </Tabs>
        </>
    );
}
export default Code;