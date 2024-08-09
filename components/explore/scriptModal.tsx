"use client"

import {Modal, ModalContent, ModalBody, ModalHeader, ModalFooter, Button, Link, Avatar, Divider, Accordion, AccordionItem, Chip } from "@nextui-org/react";
import {ParsedScript} from "@/actions/me/scripts";
import { GoPaperAirplane, GoPencil, GoTrash } from "react-icons/go";
import { AuthContext } from "@/contexts/auth";
import { useContext } from "react";

interface ScriptModalProps {
    className?: string;
    script: ParsedScript;
    open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ScriptModal = ({ className, script, open, setOpen }: ScriptModalProps) => {
    const {authenticated, me} = useContext(AuthContext);

    return (
        <Modal size="2xl" className="h-5/6" isOpen={open} onClose={() => {setOpen(false)}}>
            <ModalContent>
                <ModalHeader className="block mt-8">
                    <div className="flex justify-between items-center mb-4 mt-4">
                        <div className="flex space-x-4">
                            <Avatar />
                            <h1 className="text-4xl">{script.agentName ? script.agentName : script.displayName}</h1>
                        </div>
                        <table className="text-xs text-right">
                            <tbody>
                                <tr>
                                    <td className="text-right">Visibility:</td>
                                    <td><span className="text-primary text-left">{script.visibility}</span></td>
                                </tr>
                                {script.createdAt && (
                                    <tr>
                                        <td className="text-right">Created:</td>
                                        <td><span className="text-primary text-left">{new Date(script.createdAt).toLocaleDateString()}</span></td>
                                    </tr>
                                )}
                                {script.updatedAt && (
                                    <tr>
                                        <td className="text-right">Updated:</td>
                                        <td><span className="text-primary text-left">{new Date(script.updatedAt).toLocaleDateString()}</span></td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="text-right">Author:</td>
                                    <td><span className="text-primary text-left">{script.owner}</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <Divider className="mt-4"/>
                </ModalHeader>
                <ModalBody className="overflow-y-scroll flex-col">
                    <div className="px-2">
                        <p>{script.description ? script.description : "No description provided"}</p>
                        <div className="flex flex-wrap gap-2 w-full mt-4">
                            {script.tags?.map((tag) => (
                                <Chip size="sm" className="pb-0 mb-0" color="primary" key={tag}>{tag}</Chip>
                            ))}
                        </div>
                    </div>
                    <Accordion aria-label="script" fullWidth defaultExpandedKeys={["script"]}>
                        <AccordionItem key="script" title="Script">
                            <div className="prose dark:prose-invert h-full">
                                <pre className="h-full bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white dark:border-zinc-800 border-1 text-xs whitespace-pre-wrap">{script.content}</pre>
                            </div>
                        </AccordionItem>
                    </Accordion>
                </ModalBody>
                <ModalFooter className="flex justify-between space-x-2">
                    <Button as={Link} href={`/?file=${script.publicURL}&id=${script.id}`} color="primary" className="w-full" startContent={<GoPaperAirplane />}>Run</Button>
                        {authenticated && me?.username === script.owner && 
                            <>
                                <Button as={Link} href={`/edit?file=${script.publicURL}&id=${script.id}`} color="primary" className="w-full" startContent={<GoPencil />}>Edit</Button> 
                                <Button className="w-full" color="danger" variant="bordered" startContent={<GoTrash />}>Delete</Button>
                            </>
                        }
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default ScriptModal;