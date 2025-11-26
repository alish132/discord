import { current_profile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@/lib/generated/prisma/enums";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, context: { params: { channelId: string } }) {
    try {
        const profile = await current_profile()

        const { searchParams } = new URL(req.url)
        const serverId = searchParams.get("serverId")
        const { channelId } = context.params

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!serverId) {
            return new NextResponse("Server ID is missing", { status: 400 })
        }

        if (!channelId) {
            return new NextResponse("Channel Id is missing", { status: 400 })
        }

        const channel = await db.channel.delete({
            where: {
                id: channelId,
                serverId: serverId,
                name: { not: "general" },
                server: {
                    members: {
                        some: {
                            profileId: profile.id,
                            role: { not: "GUEST" },
                        },
                    },
                },
            },
        })

        return NextResponse.json(channel)


    } catch (error) {
        console.log("[DELETE_CHANNEL]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}