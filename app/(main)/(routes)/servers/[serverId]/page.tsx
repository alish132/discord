
import { current_profile } from '@/lib/current-profile'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

interface props{
  params: {
    serverId: string
  }
}

async function page({params}: props) {
  const {serverId} = await params
  const profile = await current_profile()

  if(!profile){
    return redirect("/")
  }

    const server = await db.server.findUnique({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile?.id
          }
        },
      },
      include: {
        channels: {
          where: {
            name: "general"
          },
          take: 1
        }
      }
    })

  const initialChannel = server?.channels[0]

  return redirect(`/servers/${serverId}/channels/${initialChannel?.id}`)
}

export default page
