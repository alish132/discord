"use client"

import React from 'react'
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import { Input } from "@/components/ui/input"
import { Button } from '../ui/button'
import FileUpload from '../message-file-upload'
import { useRouter } from 'next/navigation'
import { useModal } from '@/hooks/use-modal-store'
import qs from "query-string"
import MessageFileUpload from '../message-file-upload'



function MessageFileModal() {
    const [fileType, setFileType] = React.useState<string>("");
    const { data, isOpen, type, onClose } = useModal()
    const { apiUrl, query } = data
    const router = useRouter()

    const isModalOpen = isOpen && type === "messageFile"

    const formSchema = z.object({
        fileUrl: z.string().min(1, {
            message: "Attachment is required",
        }),
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fileUrl: "",
        }
    })

    const isLoading = form.formState.isSubmitting

    const handleClose = () => {
        form.reset()
        onClose()
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: apiUrl || "",
                query: query
            })
            
            await axios.post(url, { ...values, content: values.fileUrl, contentType: fileType })

            form.reset()
            // re-render component
            router.refresh()
            handleClose()
        } catch (error: any) {
            console.log(error)
        }
    }


    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className='bg-white text-black p-0 overflow-hidden'>
                <DialogHeader className='pt-8 px-6'>
                    <DialogTitle className='text-2xl text-center font-bold'>
                        Add an attachment
                    </DialogTitle>
                    <DialogDescription className='text-center text-zinc-500'>
                        Send a file as a message
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        <div className='space-y-8 px-6'>
                            <div className='flex items-center justify-center text-center'>
                                <FormField
                                    control={form.control}
                                    name='fileUrl'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <MessageFileUpload
                                                    endpoint="messageFile"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    fileType={fileType}
                                                    setFileType={setFileType}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>


                        </div>
                        <DialogFooter className='bg-gray-100 px-6 py-4'>
                            <Button variant="primary" disabled={isLoading}>
                                Send
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default MessageFileModal