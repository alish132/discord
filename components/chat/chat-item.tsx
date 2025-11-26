import { Member, MemberRole, Profile } from '@/lib/generated/prisma/browser'
import React, { useEffect, useState } from 'react'
import UserAvatar from '../user-avatar'
import { Edit, FileIcon, Play, ShieldAlert, ShieldCheck, Trash, Video } from 'lucide-react'
import { ActionTooltip } from '../action-tooltip'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import * as z from "zod"
import axios from 'axios'
import qs from "query-string"
import { Form, FormControl, FormField, FormItem } from '../ui/form'
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useModal } from '@/hooks/use-modal-store'
import { redirect, useRouter } from 'next/navigation'

interface ChatItemProps {
    messageId: string
    content: string
    member: Member & {
        profile: Profile
    }
    timeStamp: string
    fileType: string | null
    deleted: boolean
    currentMember: Member
    isUpdated: boolean
    socketUrl: string
    socketQuery: Record<string, string>
    fileUrl: string | null
}

const roleIconMap = {
    'GUEST': null,
    "MODERATOR": <ShieldCheck className='h-4 w-4 ml-2 text-indigo-500' />,
    "ADMIN": <ShieldAlert className='h-4 w-4 ml-2 text-rose-500' />
}

const formSchema = z.object({
    content: z.string().min(1)
})

function ChatItem({ messageId, content, member, timeStamp, fileType, deleted, currentMember, isUpdated, socketUrl, socketQuery, fileUrl }: ChatItemProps) {

    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const { onOpen } = useModal()
    const router = useRouter()


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: content
        }
    })

    useEffect(() => {
        const handleKeyDown = (event: any) => {
            if (event.key === "Escape" || event.keyCode === 27) {
                setIsEditing(false)
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    useEffect(() => {
        form.reset({
            content: content
        })
    }, [content])

    const isLoading = form.formState.isSubmitting

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: `${socketUrl}/${messageId}`,
                query: socketQuery
            })

            await axios.patch(url, values)

            form.reset()
            setIsEditing(false)
        } catch (error) {
            console.log(error)
        }
    }

    const onMemberClick = () => {
        if (member.id === currentMember.id) {
            return
        }
        router.push(`/servers/${socketQuery.serverId}/conversation/${member.id}`)
    }

    const isAdmin = currentMember.role === MemberRole.ADMIN
    const isModerator = currentMember.role === MemberRole.MODERATOR
    const isOwner = currentMember.id === member.id
    const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner)
    const canEditMessage = !deleted && isOwner && !fileUrl
    const isImage = fileType === "png" || fileType === "jpeg"
    const isPDF = fileType === "pdf"
    const isVideo = fileType === "mp4"

    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const [playIcon, setPlayIcon] = useState(true);

    return (
        <div className='relative group flex items-center hover:bg-black/5 p-4 transition w-full'>
            <div className='group flex gap-x-2 items-start w-full'>
                <div onClick={onMemberClick} className='cursor-pointer hover:drop-shadow-md transition '>
                    <UserAvatar src={member.profile.imageUrl} />
                </div>
                <div className='flex flex-col w-full'>
                    <div className='flex items-center gap-x-2'>
                        <div className='flex items-center'>
                            <p onClick={onMemberClick} className='font-semibold text-sm hover:underline cursor-pointer'>
                                {member.profile.name}
                            </p>
                            <ActionTooltip label={member.role}>
                                {roleIconMap[member.role]}
                            </ActionTooltip>
                        </div>
                        <span className='text-xs text-zinc-500 dark:text-zinc-400'>
                            {timeStamp}
                        </span>
                    </div>
                    {isImage && (
                        <a href={fileUrl!} target='_blank' rel='noopener noreferrer' className='relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48'>
                            <Image src={fileUrl!} alt='Image' fill className='object-cover' />
                        </a>
                    )}
                    {isVideo && (
                        <div className="relative mt-2 w-60 h-40 rounded-md overflow-hidden bg-black/20 cursor-pointer">
                            <video
                                ref={videoRef}
                                src={fileUrl!}
                                className="w-full h-full object-cover rounded-md"
                                controls={!playIcon}
                                onClick={(e) => {
                                    e.stopPropagation();       // Prevent outside click closing instantly
                                    setPlayIcon(true);     // Show controls when clicked

                                    // play the video
                                    if(videoRef.current){
                                        videoRef.current.pause()
                                    }
                                }}
                                onEnded={() => {
                                    setPlayIcon(true)
                                }}
                            />

                            {playIcon && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-black/30"
                                    onClick={() => {
                                        setPlayIcon(false)

                                        if (videoRef.current) {
                                            videoRef.current.play().catch(() => { });
                                        }
                                    }}
                                >
                                    {/* Play button overlay */}
                                    <div className="bg-white text-black rounded-full p-3">
                                        <Play />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {isPDF && (
                        <div className='relative flex items-center p-2 mt-2 rounded-md bg-background/10'>
                            <FileIcon className='h-10 w-10 fill-indigo-200 stroke-indigo-400' />
                            <a href={fileUrl!} target='_blank' rel='noopener noreferrer' className='relative ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline wrap-break-word max-w-[400px]'>
                                PDF File
                            </a>
                        </div>
                    )}
                    {!fileUrl && !isEditing && (
                        <p className={cn("text-sm text-zinc-600 dark:text-zinc-300", deleted && "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1")}>
                            {content}
                            {isUpdated && !deleted && (
                                <span className='text-[10px] mx-2 text-zinc-500 dark:text-zinc-400'>
                                    (edited)
                                </span>
                            )}
                        </p>
                    )}
                    {!fileUrl && isEditing && (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className='flex items-center w-full gap-x-2 pt-2'>
                                <FormField
                                    control={form.control}
                                    name='content'
                                    render={({ field }) => (
                                        <FormItem className='flex-1'>
                                            <FormControl>
                                                <div className='relative w-full'>
                                                    <Input
                                                        disabled={isLoading}
                                                        className='p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200'
                                                        placeholder='Edited Message'
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button disabled={isLoading} size="sm" variant="primary">
                                    Save
                                </Button>
                            </form>
                            <span className='text-[10px] mt-1 text-zinc-400'>
                                Press esc to cancel, enter to save
                            </span>
                        </Form>
                    )}
                </div>
            </div>
            {canDeleteMessage && (
                <div className='hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm'>
                    {canEditMessage && (
                        <ActionTooltip label='Edit'>
                            <Edit onClick={() => setIsEditing(true)} className='cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition' />
                        </ActionTooltip>
                    )}
                    <ActionTooltip label='Delete'>
                        <Trash onClick={() => onOpen("deleteMessage", { apiUrl: `${socketUrl}/${messageId}`, query: socketQuery })} className='cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition' />
                    </ActionTooltip>
                </div>
            )}
        </div>
    )
}

export default ChatItem
