"use client"

import React, {useEffect, useState} from "react"
import {AuthProvider, createTokenRequest, getAuthProviders, pollForToken, setCookie} from "@/actions/auth/auth"
import {Button, Input } from "@nextui-org/react";


export default function Login() {
    const [authProviders, setAuthProviders] = useState<AuthProvider[] | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string>("")

    useEffect(() => {
        getAuthProviders().then(aps => {
            setAuthProviders(aps)
        }).catch(reason => {
                console.log(reason)
                setErrorMessage(`failed to get auth providers: ${reason}`)
            }
        )
    }, [])

    function handleLogin(e: React.MouseEvent<HTMLButtonElement>, key: string) {
        e.preventDefault()
        const id = crypto.randomUUID()
        createTokenRequest(id, key).then((url: string) => {
            window.open(url, "_blank")
            pollForToken(id).then((token: string) => {
                setCookie(token).then(() => window.location.href = "/")
            })
        }).catch((reason: Error) => {
            setErrorMessage(`failed to create token: ${reason}`)
        })
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
    return <>
        <h1>Login</h1>
        <h2>Please select an auth provider with which to login</h2>
        <p className="text-red-300">{errorMessage}</p>
        {authProviders.map(authProvider => (
            <div className="my-4" key={authProvider.slug}>
                {!authProvider.disabled && <Button className="p-4" key={authProvider.slug}
                                                   onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleLogin(e, authProvider.serviceName || "")}>
                    {authProvider.serviceName}
                </Button>}
            </div>
        ))}
    </>
}
