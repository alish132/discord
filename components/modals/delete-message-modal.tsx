"use client"

import React, { useState } from 'react'
import axios from "axios"
import qs from "query-string"

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { useParams, useRouter } from 'next/navigation'
import { useModal } from '@/hooks/use-modal-store'
import { Button } from '../ui/button'


function DeleteMessage() {
    const {onOpen, isOpen, onClose, type, data} = useModal()
    const router = useRouter()
    const params = useParams()

    const isModalOpen = isOpen && type === "deleteMessage"
    const {apiUrl, query} = data

    const [isLoading, setIsLoading] = useState(false)

    const leaveServer = async () => {
        try {
            setIsLoading(true)

            const url = qs.stringifyUrl({
                url: apiUrl!,
                query: query
            })

            await axios.delete(url)

            onClose()
            router.refresh()
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
                        Delete Message
                    </DialogTitle>
                    <DialogDescription className='text-center text-zinc-500'>
                        Are you sure you want to do this? <br />
                        This message will be permanently deleted.
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

export default DeleteMessage