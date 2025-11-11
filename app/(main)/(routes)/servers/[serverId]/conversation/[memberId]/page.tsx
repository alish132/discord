import ChatHeader from '@/components/chat/chat-header'
import { getOrCreateConversation } from '@/lib/conversation'
import { current_profile } from '@/lib/current-profile'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import React from 'react'

interface MemberIdProps{
  params: {
    memberId: string
    serverId: string
  }
}

async function page({params}: MemberIdProps) {
  // This memberId represent the user to whom we are trying to message
  const {memberId, serverId} = await params
  const profile = await current_profile()

  if(!profile){
    return redirect("/sign-in")
  }

  // This represent our memberId 
  const currentMember = await db.member.findFirst({
    where: {
      serverId: serverId,
      profileId: profile.id
    },
    include: {
      profile: true
    }
  })
  
  if(!currentMember){
    return redirect("/")
  }

  const conversation = await getOrCreateConversation(currentMember.id, memberId)

  if(!conversation){
    return redirect(`/servers/${serverId}`)
  }

  const {memberOne, memberTwo} = conversation

  // Trying to find the receiver member(I am the person who send message and another member will be person who receive the message. So checking which one is memberId)
  const otherMember = memberOne.profileId == profile.id ? memberTwo : memberOne

  return (
    <div className='bg-white dark:bg-[#313338] flex flex-col h-full'>
      <ChatHeader name={otherMember.profile.name} serverId={serverId} type="conversation" imageUrl={otherMember.profile.imageUrl} >

      </ChatHeader>
    </div>
  )
}

export default page
