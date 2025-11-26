import { current_profile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import {v4 as uuidv4} from "uuid"

export async function PATCH(req: NextRequest, context: {params: Promise<{serverId: string}>}){
    try {
        const profile = await current_profile()
        const {serverId} = await context.params

        if(!profile){
            return new NextResponse("Unauthorized", {status: 401})
        }

        if(!serverId){
            return new NextResponse("Server ID missing", {status: 400})
        }

        const server = await db.server.update({
            where:{
                id: serverId,
                profileId: profile.id
            },
            data: {
                inviteCode: uuidv4()
            }
        })

        return NextResponse.json(server)
    } catch (error) {
        console.log("[SERVERID]", error)
        return new NextResponse("Internal error", {status: 500})
    }
}