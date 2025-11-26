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
        const {content, fileUrl, contentType} = req.body
        const {serverId, channelId} = req.query

        if(!profile){
            return res.status(401).json({error: "Unauthorized"})
        }

        if(!serverId){
            return res.status(401).json({error: "Server Id is missing"})
        }
        if(!channelId){
            return res.status(401).json({error: "Channel Id is missing"})
        }
        if(!content){
            return res.status(401).json({error: "Content is missing"})
        }

        const server = await db.server.findFirst({
            where: {
                id: serverId as string,
                members: {
                    some: {
                        profileId: profile.id
                    }
                },
            },
            include: {
                members: true
            }
        })

        if(!server){
            return res.status(404).json({message: "Server not found"})
        }

        const channel = await db.channel.findFirst({
            where: {
                id: channelId as string,
                serverId: serverId as string
            }
        })

        if(!channel){
            return res.status(404).json({message: "Channel not found"})
        }

        const member = server.members.find((member) => member.profileId === profile.id)

        if(!member){
            return res.status(404).json({message: "Member not found"})
        }

        const message = await db.message.create({
            data: {
                content: content,
                contentType: contentType,
                fileUrl: fileUrl,
                memberId: member.id,
                channelId: channelId as string,
            },
            include: {
                member: {
                    include: {
                        profile: true
                    }
                }
            }
        })

        const channelKey = `chat:${channelId}:messages`

        res?.socket?.server?.io?.emit(channelKey, message)
        // console.log("Send new message")

        return res.status(200).json(message)

    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Internal Error"})
    }

}