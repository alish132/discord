import { current_profile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, {params}: { params: { serverId: string } }) {
    try {
        const profile = await current_profile()
        const { serverId } = await params

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!serverId) {
            return new NextResponse("Server ID is missing", { status: 400 })
        }

        const server = await db.server.delete({
            where: {
                id: serverId,
                profileId: profile.id
            }
        })

        return NextResponse.json(server)
    } catch (error) {
        console.log("[SERVER_DELETE]", error)
        return new NextResponse("Internal server error", { status: 500 })
    }
}