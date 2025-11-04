import { current_profile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { ChannelType, MemberRole } from '@/lib/generated/prisma/enums';
import { redirect } from 'next/navigation';
import ServerHeader from './server-header';
import { ScrollArea } from '../ui/scroll-area';
import ServerSearch from './server-search';
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from 'lucide-react';

interface ServerSidebarProps{
  serverId: string;
}

// For search functionality
const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />
}

// For search functionality
const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: <ShieldCheck className='h-4 w-4 mr-2 text-indigo-500' />,
  [MemberRole.ADMIN]: <ShieldAlert className='h-4 w-4 mr-2 text-rose-500' />,
}

async function ServerSidebar({serverId}: ServerSidebarProps) {
  const profile = await current_profile()

  if(!profile){
    return redirect('/')
  }

  const server = await db.server.findFirst({
    where: {
      id: serverId,
    },
    include:{
      channels: {
        orderBy: {
          createdAt: "asc"
        }
      },
      members: {
        include: {
          profile: true
        }, 
        orderBy: {
          role: "asc"
        }
      }
    }
  })

  const textChannels = server?.channels.filter((channel) => channel.type === ChannelType.TEXT)
  const audioChannels = server?.channels.filter((channel) => channel.type === ChannelType.AUDIO)
  const videoChannels = server?.channels.filter((channel) => channel.type === ChannelType.VIDEO)
  const members = server?.members.filter((member) => member.profileId !== profile.id)

  const role = server?.members.find((member) => member.profileId === profile.id)?.role

  return (
    <div className='flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]'>
      <ServerHeader
      server={server}
      role={role}
       />
       <ScrollArea className='flex-1 px-3' >
        <div className="mt-2"></div>
        {/* Search functionality */}
        <ServerSearch
        data={[
          {
            label: "Text Channels",
            type: "channel",
            data: textChannels?.map((channel) => ({
              id: channel.id,
              name: channel.name,
              icon: iconMap[channel.type]
            }))
          },
          {
            label: "Voice Channels",
            type: "channel",
            data: audioChannels?.map((channel) => ({
              id: channel.id,
              name: channel.name,
              icon: iconMap[channel.type]
            }))
          },
          {
            label: "Video Channels",
            type: "channel",
            data: videoChannels?.map((channel) => ({
              id: channel.id,
              name: channel.name,
              icon: iconMap[channel.type]
            }))
          },
          {
            label: "Members",
            type: "member",
            data: members?.map((member) => ({
              id: member.id,
              name: member.profile.name,
              icon: roleIconMap[member.role]
            }))
          },
        ]}
         />
       </ScrollArea>
    </div>
  )
}

export default ServerSidebar
