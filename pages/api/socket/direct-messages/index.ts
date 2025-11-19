import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";
import { currentProfileForPages } from "@/lib/current-profile-for-pages";
import { db } from "@/lib/db";

export default async function handler(req:NextApiRequest, res: NextApiResponseServerIo) {

    if(req.method !== "POST"){
        return res.status(405).json({error: "Method is not allowed"})
    }

    try {
        const profile = await currentProfileForPages(req)
        let {content, fileUrl, contentType} = req.body
        const {conversationId} = req.query

        fileUrl = fileUrl || ""
        if(!profile){
            return res.status(401).json({error: "Unauthorized"})
        }

        if(!conversationId){
            return res.status(401).json({error: "Server Id is missing"})
        }

        if(!content){
            return res.status(401).json({error: "Content is missing"})
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
            return res.status(404).json({message: "Conversation not found"})
        }

        const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo
        console.log(member)

        if(!member){
            return res.status(404).json({message: "Member not found"})
        }

        const message = await db.directMessage.create({
            data: {
                content: content,
                contentType: contentType,
                fileUrl: fileUrl,
                memberId: member.id,
                conversationId: conversationId as string
            },
            include: {
                member: {
                    include: {
                        profile: true
                    }
                }
            }
        })

        const channelKey = `chat:${conversationId}:messages`

        res?.socket?.server?.io?.emit(channelKey, message)

        return res.status(200).json(message)

    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Internal Error"})
    }

}