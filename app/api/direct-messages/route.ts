import { current_profile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { DirectMessage, Message } from "@/lib/generated/prisma/client";
import { NextResponse } from "next/server";

const MESSAGE_BATCH = 10

export async function GET(req: NextResponse){
    try {
        const profile = await current_profile()
        const {searchParams} = new URL(req.url)

        const cursor = searchParams.get("cursor")
        const conversationId = searchParams.get("conversationId")

        if(!profile){
            return new NextResponse("Unauthorized", {status: 401})
        }

        if(!conversationId){
            return new NextResponse("Conversation Id is missing", {status: 400})
        }

        let messages: DirectMessage[] = []

        if(cursor){
            messages = await db.directMessage.findMany({
                take: MESSAGE_BATCH,
                skip: 1,
                cursor: {
                    id: cursor
                },
                where: {
                    conversationId: conversationId,
                }, 
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            })
        } else {
            messages= await db.directMessage.findMany({
                take: MESSAGE_BATCH,
                where: {
                    conversationId: conversationId
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            })
        }

        let nextCursor = null
        if(messages.length === MESSAGE_BATCH){
            nextCursor = messages[MESSAGE_BATCH - 1].id
        }

        return NextResponse.json({
            items: messages,
            nextCursor: nextCursor
        })
        
    } catch (error) {
        console.log(error)
        return new NextResponse("Internal error", {status: 500})
    }
}