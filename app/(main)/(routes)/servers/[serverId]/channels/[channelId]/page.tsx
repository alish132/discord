import ChatHeader from '@/components/chat/chat-header'
import ChatInput from '@/components/chat/chat-input'
import { current_profile } from '@/lib/current-profile'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import React from 'react'

interface ChannelIdPageProps {
  params: {
    serverId: string,
    channelId: string
  }
}

async function page({ params }: ChannelIdPageProps) {
  const profile = await current_profile()
  const {serverId, channelId} = await params

  if (!profile) {
    return redirect('/')
  }

  const channel = await db.channel.findUnique({
    where: {
      id: channelId
    }
  })

  const member = await db.member.findFirst({
    where: {
      serverId: serverId,
      profileId: profile.id
    }
  })
  
  if(!channel || !member){
    return redirect("/")
  }


  return (
    <div className='bg-white dark:bg-[#313338] flex flex-col h-full'>
      <ChatHeader serverId={channel.serverId} name={channel.name} type='channel' />
      <div className='flex-1'>Future messages</div>
      <ChatInput apiUrl='/api/socket/messages' name={channel.name} query={{
        channelId: channel.id,
        serverId: channel.serverId
      }} type='channel' />
    </div>
  )
}

export default page
