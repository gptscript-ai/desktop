import { get } from "@/actions/common"

export interface Me {
    username: string
    email: string
}

export async function getMe(): Promise<Me> {
    return await get("me", "")
}
