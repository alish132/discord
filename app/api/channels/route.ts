import { current_profile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@/lib/generated/prisma/enums";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    try {
        const profile = await current_profile()
        const {name, type}: {name: string, type:string} = await req.json()

        const {searchParams} = new URL(req.url)
        const serverId = searchParams.get("serverId")

        if(!profile){
            return new NextResponse("Unauthorized", {status:401})
        }

        if(!serverId){
            return new NextResponse("Server ID is missing", {status:400})
        }

        if(name.toLowerCase() === "general"){
            return new NextResponse("Name cannot be 'general'", {status: 400})
        }

        const server = await db.server.update({
            where:{
                id: serverId,
                members: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }
            },
            data: {
                channels:{
                    create: {
                        name: name,
                        type: type,
                        profileId: profile.id
                    }
                }
            }
        })

        return NextResponse.json(server)
    } catch (error) {
        console.log("[CREATE_CHANNEL_POST]", error)
        return new NextResponse("Internal Error", {status:500})
    }
}