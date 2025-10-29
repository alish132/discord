import { current_profile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@/lib/generated/prisma/enums";
import { NextRequest, NextResponse } from "next/server";
import {v4 as uuidv4} from "uuid"

export async function POST(req: NextRequest){
    try {
        const {name, imageUrl} = await  req.json()
        const profile = await current_profile()

        if(!profile){
            return new NextResponse("Unauthorized", {status: 401})
        }

        const server = await db.server.create({
            data: {
                name: name,
                imageUrl: imageUrl,
                inviteCode: uuidv4(),
                profileId: profile.id,
                channels: {
                    create: [
                        {name: "general", profileId: profile.id}
                    ]
                },
                members: {
                    create: [
                        {profileId: profile.id, role: MemberRole.ADMIN}
                    ]
                }
            }
        })

        return NextResponse.json(server)

    } catch (error:any) {
        console.log("[server_post]: ", error)
        return new NextResponse("Internal Error", {status: 500})
    }
}