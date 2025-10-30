"use client"

import React from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import { ActionTooltip } from '../action-tooltip'

interface NavigationItemProps{
    id: string;
    imageUrl: string;
    name: string
}

function NavigationItem({id, imageUrl, name}: NavigationItemProps) {
    const params = useParams()
    const router = useRouter()

    const onclick = () => {
        router.push(`/servers/${id}`)
    }

  return (
    <ActionTooltip side='right' align='center' label={name}>
        <button onClick={onclick} className='group relative flex items-center'>
            <div className={cn(
                "absolute left-0 bg-primary rounded-r-full transition-all w-1",
                params?.serverId !== id && "group-hover:h-5",
                params?.serverId === id ? "h-9" : "h-2"
            )} />
            <div className={cn(
                "relative group flex mx-3 h-12 w-12 rounded-3xl group-hover:rounded-2xl transition-all overflow-hidden",
                params?.serverId === id && "bg-primary/10 text-primary rounded-2xl"
            )}>
                <Image
                fill
                src={imageUrl}
                alt='Server'
                 />
            </div>
        </button>
    </ActionTooltip>
  )
}

export default NavigationItem
