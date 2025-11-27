import { current_profile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType, MemberRole } from "@/lib/generated/prisma/enums";
// import { ChannelType, MemberRole } from "@/lib/generated/prisma/enums";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, {params} : { params: Promise<{ channelId: string }> }) {
    try {
        const profile = await current_profile()
    
        const { searchParams } = new URL(req.url)
        const serverId = searchParams.get("serverId")
        const { channelId } = await params
        const {name, type}:{name:string, type: ChannelType} = await req.json()
    
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }
    
        if (!serverId) {
            return new NextResponse("Server ID is missing", { status: 400 })
        }
    
        if (!channelId) {
            return new NextResponse("Channel Id is missing", { status: 400 })
        }
    
        if(!name){
            return new NextResponse("Name is missing", {status: 400})
        }

        if(name.trim().toLowerCase() === "general"){
            return new NextResponse("Name cannot be changed", {status:400})
        }
    
        if(!type){
            return new NextResponse("Type is missing", {status: 400})
        }
    
        const channel = await db.channel.update({
            where: {
                id: channelId,
                serverId: serverId,
                name: {
                    not: "general"
                },
                server: {
                    members: {
                        some: {
                            profileId: profile.id,
                            role: {
                                not: MemberRole.GUEST
                            }
                        }
                    }
                }
            },
            data: {
                name: name
            }
        })

        return NextResponse.json(channel)
    } catch (error) {
        console.log("[EDIT_CHANNEL]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}