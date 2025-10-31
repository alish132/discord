import { Server, Member, Profile } from "./lib/generated/prisma/client";

export type ServerWithMemberWithProfile = Server & {
    members: (Member & {profile: Profile})[];
}