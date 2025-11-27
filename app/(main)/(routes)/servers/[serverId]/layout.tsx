// import ServerSidebar from '@/components/server/server-sidebar'
// import { current_profile } from '@/lib/current-profile'
// import { db } from '@/lib/db'
// import { redirect } from 'next/navigation'
// import React from 'react'

// async function ServerIdLayout({ children, params }: { children: React.ReactNode, params: { serverId: string } }) {
//   const profile = await current_profile()
//   const {serverId} = params

//   if (!profile) {
//     return redirect("/sign-in")
//   }

//   const server = await db.server.findFirst({
//     where: {
//       id: serverId,
//       members: {
//         some: {
//           profileId: profile.id
//         }
//       }
//     }
//   })

//   if (!server) {
//     return redirect("/")
//   }

//   return (
//     <div className='h-full'>
//       <div className='hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0 '>
//         <ServerSidebar serverId={serverId} />
//       </div>
//       <main className='h-full md:pl-60'>
//         {children}
//       </main>
//     </div>
//   )
// }

// export default ServerIdLayout

import ServerSidebar from '@/components/server/server-sidebar'
import { current_profile } from '@/lib/current-profile'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function ServerIdLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ serverId: string }>
}) {

  const profile = await current_profile()
  const { serverId } = await params   // ✅ no await

  if (!profile) {
    redirect("/sign-in")
  }

  const server = await db.server.findFirst({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id
        }
      }
    }
  })

  if (!server) {
    redirect("/")
  }

  return (
    <div className='h-full'>
      <div className='hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0 '>
        <ServerSidebar serverId={serverId} />
      </div>
      <main className='h-full md:pl-60'>
        {children}
      </main>
    </div>
  )
}

