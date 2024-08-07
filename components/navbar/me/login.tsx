"use client"

import React, { useContext, useEffect, useState } from "react"
import { AuthProvider, getAuthProviders, loginThroughTool} from "@/actions/auth/auth"
import { Button } from "@nextui-org/react";
import { AuthContext } from "@/contexts/auth";
import { getMe } from "@/actions/me/me";


export default function Login() {
    const [authProviders, setAuthProviders] = useState<AuthProvider[] | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const {setMe} = useContext(AuthContext);

    useEffect(() => {
        getAuthProviders().then(aps => {
            setAuthProviders(aps)
        }).catch(reason => {
            console.log(reason)
            setErrorMessage(`failed to get auth providers: ${reason}`)
        })
    }, [])

    function handleLogin(e: React.MouseEvent<HTMLButtonElement>, key: string) {
        e.preventDefault()
        loginThroughTool()
            .then(() => getMe().then(me => setMe(me)) )
            .catch((reason) => setErrorMessage(`failed to login: ${reason}`) );
    }

    if (authProviders === undefined) {
        return <h1>Loading...</h1>
    }
    if (authProviders.length === 0) {
        return (
            <div>
                <h1>No Auth providers found</h1>
                <p>You can <a href="/auth-providers">create an auth provider</a>.</p>
            </div>
        )
    }
    return (
        <div className="h-full w-full p-4">
            <div className="text-center">
                <h1 className="text-lg">Welcome!</h1>
                <h2>To get started, please select an auth provider to login with.</h2>
                {errorMessage && <p className="text-red-300">{errorMessage}</p>}
            </div>
            <div className="grid h-1/3 overflow-y-scroll space-y-2 mx-auto pt-6">
                {authProviders.map(authProvider => {
                    if (!authProvider.disabled) {
                        return (
                            <Button
                                className="w-3/4 mx-auto"
                                size="lg"
                                color="primary"
                                key={authProvider.slug}
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleLogin(e, authProvider.serviceName || "")}
                            >
                                {authProvider.serviceName}
                            </Button>
                        )
                    } else {
                        return null;
                    }
                })}
            </div>
        </div>
    );
}
