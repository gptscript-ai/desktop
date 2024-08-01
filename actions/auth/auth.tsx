"use server"

import {cookies} from "next/headers"
import {create, get, list } from "@/actions/common"

export interface AuthProvider {
    id?: string
    type: string
    serviceName?: string
    slug?: string
    clientID?: string
    clientSecret?: string
    oauthURL?: string
    tokenURL?: string
    scopes?: string
    redirectURL?: string
    disabled?: boolean
}

export async function setCookie(token: string): Promise<void> {
    cookies().set("gateway_token", token, {domain: "localhost"})
}

export async function logout(): Promise<void> {
    cookies().delete("gateway_token")
}

export async function getAuthProviders(): Promise<AuthProvider[]> {
    return await list("auth-providers")
}

export async function createTokenRequest(id: string, oauthServiceName: string): Promise<string> {
    return (await create({id: id, serviceName: oauthServiceName} as any, "token-request"))["token-path"]
}

export async function pollForToken(id: string): Promise<string> {
    while (true) {
        const token = (await get<any>("token-request", id)).token || ""
        if (token != "") {
            return token
        }

        await new Promise(r => setTimeout(r, 1000))
    }
}