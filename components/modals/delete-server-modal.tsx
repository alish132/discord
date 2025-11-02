"use client"

import React, { useState } from 'react'
import axios from "axios"

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'
import { useModal } from '@/hooks/use-modal-store'
import { Button } from '../ui/button'


function DeleteServerModal() {
    const {onOpen, isOpen, onClose, type, data} = useModal()
    const router = useRouter()

    const isModalOpen = isOpen && type === "deleteServer"
    const {server} = data

    const [isLoading, setIsLoading] = useState(false)

    const leaveServer = async () => {
        try {
            setIsLoading(true)

            await axios.delete(`/api/servers/delete/${server?.id}`)

            onClose()
            router.refresh()
            router.push("/")
        } catch (error) {
            console.log(error)
        } finally{
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className='bg-white text-black p-0 overflow-hidden'>
                <DialogHeader className='pt-8 px-6'>
                    <DialogTitle className='text-2xl text-center font-bold'>
                        Delete Server
                    </DialogTitle>
                    <DialogDescription className='text-center text-zinc-500'>
                        Are you sure you want to delete <span className='text-indigo-500 font-semibold'>{server?.name}</span> server <br />
                        <span >This action can not be undone!</span>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className='bg-gray-100 px-6 py-4'>
                    <div className='flex items-center justify-between w-full'>
                        <Button className='cursor-pointer' disabled={isLoading} variant="ghost" onClick={() => {onClose()}}>
                            Cancel
                        </Button>
                        <Button disabled={isLoading} className='bg-red-500 text-white hover:bg-red-600 cursor-pointer' onClick={() => {leaveServer()}}>
                            Confirm
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteServerModal