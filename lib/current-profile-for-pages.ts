import { getAuth } from "@clerk/nextjs/server";
import { db } from "./db";
import { NextApiRequest } from "next";

// Just a function to check whether user is loggedIn or not. if yes then return user info and if not then return null
export const currentProfileForPages = async (req: NextApiRequest) => {
    const {userId} =  getAuth(req)

    if(!userId){
        return null
    }

    const profile = await db.profile.findUnique({
        where: {
            userId: userId
        }
    })

    return profile
}