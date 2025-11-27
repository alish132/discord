import { current_profile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, {params}: { params: { serverId: string } }) {
    try {
        const profile = await current_profile()
        const { serverId } = await params
        const {name, ImageUrl} = await req.json()

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!serverId) {
            return new NextResponse("ServerId is missing", { status: 400 })
        }

        const updatedServer = await db.server.update({
            where: {
                id: serverId,
                profileId: profile.id
            },
            data: {
                name: name,
                imageUrl: ImageUrl
            }
        })

        return NextResponse.json(updatedServer)

    } catch (error) {
        console.log("[SERVERID PATCH]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
}