import { current_profile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, {params}: { params: { memberId: string }}) {
    try {
        const profile = await current_profile()

        // Extracting query string from URL
        const { searchParams } = new URL(req.url)
        const serverId = searchParams.get("serverId")

        const { role } = await req.json()
        const { memberId } = await params

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!serverId) {
            return new NextResponse("Server ID is missing", { status: 400 })
        }

        if (!memberId) {
            return new NextResponse("Member ID is missing", { status: 400 })
        }

        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: profile.id
            },
            data: {
                members: {
                    update: {
                        where: {
                            id: memberId,
                            NOT: {
                                profileId: profile.id
                            }
                        },
                        data: {
                            role: role
                        }
                    }
                }
            },
            include: {
                members: {
                    include: {
                        profile: true,
                    },
                    orderBy: {
                        role: "asc"
                    }
                }
            }
        })

        return NextResponse.json(server)

    } catch (error) {
        console.log("[MEMBERSID_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}


export async function DELETE(req: NextRequest, {params}: {params: {memberId: string}}){
    try {
        const profile = await current_profile()
        const {searchParams} = new URL(req.url)
        const serverId = searchParams.get("serverId")
        const {memberId} = await params

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!serverId) {
            return new NextResponse("Server ID is missing", { status: 400 })
        }

        if (!memberId) {
            return new NextResponse("Member ID is missing", { status: 400 })
        }

        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: profile.id
            }, 
            data: {
                members: {
                    deleteMany: {
                        id: memberId,
                        profileId: {
                            not: profile.id
                        }
                    }
                }
            }, 
            include: {
                members: {
                    include: {
                        profile: true
                    },
                    orderBy: {
                        role: "asc"
                    }
                }
            }
        })

        return NextResponse.json(server)
        
    } catch (error) {
        console.log("[MEMBER ID DELETE]", error)
        return new NextResponse("Internal Error", {status:500})
    }
}