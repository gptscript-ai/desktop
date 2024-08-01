"use client"

import {Popover, PopoverTrigger, PopoverContent, Button, User, Link, Modal, ModalContent, ModalBody, Divider} from "@nextui-org/react";
import { useState, useEffect, useContext} from 'react';
import { GoPersonFill } from "react-icons/go";
import Login from "@/components/navbar/me/login"
import Logout from "@/components/navbar/me/logout"
import { AuthContext } from "@/contexts/auth";
import { HiOutlineCog6Tooth } from "react-icons/hi2";

interface MeProps {
    className?: string;
}

const Me = ({ className }: MeProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { authenticated, me } = useContext(AuthContext);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        authenticated && setOpen(false);
    }, [authenticated])

    const loginModal = () => (
        <Modal size="3xl" className="h-3/4" isOpen={open} onClose={() => {setOpen(false)}}>
            <ModalContent>
                <ModalBody className="w-full">
                    <Login />
                </ModalBody>
            </ModalContent>
        </Modal>
    )
    return (<>
        {loginModal()}
        <Popover placement="bottom-end" size="lg" isOpen={isOpen} onOpenChange={(open)=> setIsOpen(open)}>
            <PopoverTrigger>
                <Button 
                    radius="full"
                    startContent={<GoPersonFill />} 
                    className={`${className}`}
                    color={authenticated ? 'primary' : 'default'}
                    isIconOnly
                />
            </PopoverTrigger>
            <PopoverContent className="flex flex-col p-4">
                {authenticated && 
                    <>
                        <User 
                            classNames={{
                                name: "max-w-[200px] truncate",
                                description: "max-w-[200px] truncate"
                            }}
                            name={`${me?.username}`}
                            description={`${me?.email}`}
                        />
                        <Divider className="my-2"/>
                    </>
                }
                {authenticated ? 
                    <Logout /> :
                    <Button 
                        className="w-full"
                        style={{justifyContent: "flex-start"}}
                        onPress={() => { setOpen(true)}}
                        startContent={<GoPersonFill />}
                        variant="light"
                    >
                        Login
                    </Button>
                }
                {authenticated && 
                    <>
                        {/* <Button 
                            as={Link} 
                            style={{justifyContent: "flex-start"}}
                            href="/" 
                            variant="light" 
                            startContent={<HiOutlineCog6Tooth/>}
                            className="w-full"
                        >
                            Settings
                        </Button> */}
                    </>
                }
            </PopoverContent>
        </Popover>
    </>);
};

export default Me;