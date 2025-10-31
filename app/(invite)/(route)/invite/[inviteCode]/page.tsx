import { current_profile } from '@/lib/current-profile'
import { db } from '@/lib/db'
import { MemberRole } from '@/lib/generated/prisma/enums'
import { redirect } from 'next/navigation'
import React from 'react'

interface InviteCodePageProps {
  params: {
    inviteCode: string
  }
}

async function InviteCodePage({ params }: InviteCodePageProps) {
  const profile = await current_profile()
  const { inviteCode } = await params

  if (!profile) {
    return redirect("/sign-in")
  }

  if (!inviteCode) {
    return redirect("/")
  }

  const isUserAlreadyExistsInServer = await db.server.findFirst({
    where: {
      inviteCode: inviteCode,
      members: {
        some: {
          profileId: profile.id
        }
      }
    }
  })

  if (isUserAlreadyExistsInServer) {
    return redirect(`/servers/${isUserAlreadyExistsInServer.id}`)
  }

  const server = await db.server.update({
    where: {
      inviteCode: inviteCode,
    },
    data: {
      members: {
        create: [
          {
            profileId: profile.id,
          }
        ]
      }
    }
  })

  if(server){
    return redirect(`/servers/${server.id}`)
  }

  return (
    <div>
      Invite InviteCodePage
    </div>
  )
}

export default InviteCodePage
