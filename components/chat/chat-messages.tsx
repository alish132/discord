"use client"

import { Member, Message, Profile } from '@/lib/generated/prisma/browser'
import React, { Fragment } from 'react'
import ChatWelcome from './chat-welcome'
import { useChatQuery } from '@/hooks/use-chat-query'
import { Loader2, ServerCrash } from 'lucide-react'
import ChatItem from './chat-item'
import { format } from "date-fns"

const DATE_FORMAT = "d MMM yyyy, hh:mm a"

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile
  }
}

interface ChatMessagesProps {
  name: string
  member: Member
  chatId: string
  apiUrl: string
  socketUrl: string
  socketQuery: {
    channelId: string,
    serverId: string
  }
  paramKey: "channelId" | "conversationId"
  paramValue: string
  type: "channel" | "conversation"

}

function ChatMessages({ name, member, chatId, apiUrl, socketUrl, socketQuery, paramKey, paramValue, type }: ChatMessagesProps) {

  const queryKey = `chat:${chatId}`
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, isLoading } = useChatQuery({
    querykey: queryKey,
    apiUrl: apiUrl,
    paramsKey: paramKey,
    paramsValue: paramValue
  })

  if (isLoading) {
    return (
      <div className='flex flex-col flex-1 justify-center items-center'>
        <Loader2 className='h7 w-7 text-zinc-500 animate-spin my-4' />
        <p className='text-xs text-zinc-500 dark:text-zinc-400'>
          Loading messages...
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className='flex flex-col flex-1 justify-center items-center'>
        <ServerCrash className='h7 w-7 text-zinc-500 my-4' />
        <p className='text-xs text-zinc-500 dark:text-zinc-400'>
          Something went wrong!
        </p>
      </div>
    )
  }

  return (
    <div className='flex-1 flex flex-col py-4 overflow-y-auto'>
      <div className='flex-1'>
        <ChatWelcome name={name} type={type} />
        <div className='flex flex-col-reverse mt-auto'>
          {data?.pages?.map((group, i) => (
            <Fragment key={i}>
              {group.items.map((message: MessageWithMemberWithProfile) => (
                <ChatItem key={message.id} content={message.content} currentMember={member} deleted={message.deleted} fileType={message.contentType} fileUrl={message.fileUrl} timeStamp={format(new Date(message.createdAt), DATE_FORMAT)} isUpdated={message.createdAt !== message.updatedAt} member={message.member} socketUrl={socketUrl} socketQuery={socketQuery} messageId={message.id} />
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChatMessages
