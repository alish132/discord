import { currentProfileForPages } from "@/lib/current-profile-for-pages";
import { db } from "@/lib/db";
import { MemberRole } from "@/lib/generated/prisma/enums";
import { NextApiResponseServerIo } from "@/types";
import { Rss } from "lucide-react";
import { NextApiRequest } from "next";

export default async function Handler(req: NextApiRequest, res: NextApiResponseServerIo) {
    if (req.method !== "DELETE" && req.method !== "PATCH") {
        return res.status(405).json({ error: "Method is not allowed" })
    }

    try {
        const profile = await currentProfileForPages(req)
        const { messageId, conversationId } = req.query
        const { content } = req.body

        if (!profile) {
            return res.status(401).json({ error: "Unauthorized request" })
        }

        if (!conversationId) {
            return res.status(400).json({ error: "Conversation Id is missing" })
        }

        if (!messageId) {
            return res.status(400).json({ error: "Message Id is missing" })
        }

        const conversation = await db.conversation.findFirst({
            where: {
                id: conversationId as string,
                OR: [
                    {
                        memberOne: {
                            profileId: profile.id
                        }
                    },
                    {
                        memberTwo: {
                            profileId: profile.id
                        }
                    }
                ]
            },
            include: {
                memberOne: {
                    include: {
                        profile: true
                    }
                },
                memberTwo: {
                    include: {
                        profile: true
                    }
                }
            }
        })

        if(!conversation){
            return res.status(404).json({error: "Conversation not found"})
        }

        const currentMember = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo


        let message = await db.directMessage.findFirst({
            where: {
                id: messageId as string,
                conversationId: conversationId as string,
                memberId: currentMember.id
            },
        })

        if(!message || message.deleted){
            return res.status(404).json({error: "Message not found"})
        }


        if(req.method === "DELETE"){
            message = await db.directMessage.update({
                where: {
                    id: messageId as string
                },
                data: {
                    fileUrl: "",
                    content: "This message has been deleted",
                    deleted: true
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                }
            })
        }

        if(req.method === "PATCH"){
            message = await db.directMessage.update({
                where: {
                    id: messageId as string,
                    conversationId: conversationId as string,
                    memberId: currentMember.id
                },
                data: {
                    content: content
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                }
            })
        }

        const updateKey = `chat:${conversation.id}:messages:update`

        res?.socket?.server?.io?.emit(updateKey, message)

        return res.status(200).json(message)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal server error" })
    }
}