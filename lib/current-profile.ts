import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

// Just a function to check whether user is loggedIn or not. if yes then return user info and if not then return null
export const current_profile = async () => {
    const user = await currentUser()

    if(!user){
        return null
    }

    const profile = await db.profile.findUnique({
        where: {
            userId: user.id
        }
    })

    return profile
}