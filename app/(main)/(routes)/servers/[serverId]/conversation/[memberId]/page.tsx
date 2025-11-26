import ChatHeader from '@/components/chat/chat-header'
import ChatInput from '@/components/chat/chat-input'
import ChatMessages from '@/components/chat/chat-messages'
import { MediaRoom } from '@/components/media-room'
import { getOrCreateConversation } from '@/lib/conversation'
import { current_profile } from '@/lib/current-profile'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

interface MemberIdProps {
  params: {
    memberId: string
    serverId: string
  },
  searchParams: {
    video?: boolean
  }
}

async function page({ params, searchParams }: MemberIdProps) {
  // This memberId represent the user to whom we are trying to message
  const { memberId, serverId } = await params
  const {video} = await searchParams
  const profile = await current_profile()

  if (!profile) {
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

  if (!currentMember) {
    return redirect("/")
  }

  const conversation = await getOrCreateConversation(currentMember.id, memberId)

  if (!conversation) {
    return redirect(`/servers/${serverId}`)
  }

  const { memberOne, memberTwo } = conversation

  // Trying to find the receiver member(I am the person who send message and another member will be person who receive the message. So checking which one is memberId)
  const otherMember = memberOne.profileId == profile.id ? memberTwo : memberOne

  return (
    <div className='bg-white dark:bg-[#313338] flex flex-col h-full'>
      <ChatHeader name={otherMember.profile.name} serverId={serverId} type="conversation" imageUrl={otherMember.profile.imageUrl} />

      {video && (
        <MediaRoom chatId={conversation.id} video={true} audio={true} />
      )}

      {!video && (
        <>
          <ChatMessages member={currentMember} name={otherMember.profile.name} chatId={conversation.id} type='conversation' apiUrl='/api/direct-messages' paramKey='conversationId' paramValue={conversation.id} socketUrl='/api/socket/direct-messages' socketQuery={{ conversationId: conversation.id }} />

          <ChatInput name={otherMember.profile.name} type='conversation' apiUrl='/api/socket/direct-messages' query={{ conversationId: conversation.id }} />
        </>
      )}


    </div>
  )
}

export default page
