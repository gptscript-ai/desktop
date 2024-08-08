"use server"

import {cookies} from "next/headers"
import {create, get, list } from "@/actions/common"
import { gpt } from "@/config/env"
import { Block, RunEventType, ToolDef } from "@gptscript-ai/gptscript"


const tokenRequestToolInstructions = `
Credential: github.com/thedadams/gateway-creds

#!/usr/bin/env python3

import os
import json

output = {
    "token": os.getenv("GPTSCRIPT_GATEWAY_API_KEY", ""),
    "expiresAt": os.getenv("GPTSCRIPT_CREDENTIAL_EXPIRATION", ""),
}

print(json.dumps(output), end="")
`;

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

export async function setCookies(token: string, expiresAt: string): Promise<void> {
    cookies().set("gateway_token", token, {domain: "localhost"})
    cookies().set("expires_at", expiresAt, {domain: "localhost"})
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

export async function handleTokenAge(): Promise<boolean> {
    const expiresAt = cookies().get("expires_at") || ""
    if (!expiresAt || !expiresAt.value) return true


    if (new Date(expiresAt.value).getTime() - Date.now() < 1000 * 60 * 5) {
        loginThroughTool();
        return true
    }
    return false
}

export async function loginThroughTool(): Promise<void> {
    const run = await gpt().evaluate({instructions: tokenRequestToolInstructions}, {prompt: true})
    run.on(RunEventType.Prompt, (data) => {
        gpt().promptResponse({id: data.id, responses: {}})
    })

    const response = JSON.parse(await run.text()) as {token: string, expiresAt: string}
    setCookies(response.token, response.expiresAt)
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