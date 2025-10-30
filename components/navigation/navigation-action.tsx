"use client"

import { Plus } from 'lucide-react'
import React from 'react'
import { ActionTooltip } from '../action-tooltip'
import { useModal } from '@/hooks/use-modal-store'

function NavigationAction() {
  const {onOpen} = useModal()
  return (
    <div>
        <ActionTooltip side='right' align='center' label='Add a server'>
        <button onClick={() => onOpen("createServer")} className='group flex items-center'>
            <div className='flex mx-3 h-12 w-12 rounded-3xl group-hover:rounded-2xl transition-all overflow-hidden items-center justify-center group-hover:bg-emerald-500 bg-neutral-700'>
                <Plus
                className='group-hover:text-white transition text-emerald-500'
                size={25}
                 />
            </div>
        </button>
        </ActionTooltip>
    </div>
  )
}

export default NavigationAction
