import { current_profile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, context: {params: Promise<{serverId: string}>}){
    try {
        const profile = await current_profile()
        const {serverId} = await context.params
    
        if(!profile){
            return new NextResponse("Unauthorized", {status: 401})
        }
    
        if(!serverId){
            return new NextResponse("Server ID is missing", {status: 400})
        }

        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: {
                    not: profile.id
                },
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
            data: {
                members: {
                    deleteMany: {
                        profileId: profile.id
                    }
                }
            }
        })
        
        return NextResponse.json(server)
    } catch (error) {
        console.log("[SERVER_LEAVE]", error)
        return new NextResponse("Internal server error", {status: 500})
    }
}