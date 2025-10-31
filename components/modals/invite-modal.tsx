"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Check, CheckCheck, Copy, RefreshCw } from 'lucide-react'
import { useOrigin } from '@/hooks/use-origin'


function InviteModal() {
    const {onOpen, isOpen, onClose, type, data} = useModal()

    const isModalOpen = isOpen && type === "invite"
    const {server} = data
    
    const origin = useOrigin()
    const inviteUrl = `${origin}/invite/${server?.inviteCode}`

    const [copied, setCopied] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const onCopy = () => {
        navigator.clipboard.writeText(inviteUrl)
        setCopied(true)

        setTimeout(() => {
            setCopied(false)
        }, 1000);
    }

    const generateNewLink = async () => {
        try {
            setIsLoading(true)
            const response = await axios.patch(`/api/servers/${server?.id}/invite-code`)

            onOpen("invite", {server: response.data})
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
                        Invite Friends
                    </DialogTitle>
                </DialogHeader>
                <div className='p-6'>
                    <Label className='uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70'>
                    Server invite link
                    </Label>
                    <div className='flex items-center mt-2 gap-x-2'>
                        <Input disabled={isLoading} className=' bg-zinc-300/50! border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0' value={inviteUrl} />
                        <Button disabled={isLoading} onClick={onCopy} variant="ghost" size="icon" className='hover:bg-blue-500!'>
                            {copied ? <Check /> : <Copy className='w-4 h-4' />}
                        </Button>
                    </div>
                    <Button disabled={isLoading} onClick={generateNewLink} variant="link" size="sm" className='text-xs text-zinc-500 mt-4'>
                        Generate a new link
                        <RefreshCw className='w-4 h-4' />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default InviteModal