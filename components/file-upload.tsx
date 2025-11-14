"use client"

import React from 'react'
import { UploadDropzone,UploadButton } from '@/lib/uploadthing'
import { FileIcon, X } from 'lucide-react'
import Image from 'next/image'
import { UTApi } from 'uploadthing/server'
import axios from 'axios'

interface FileUploadProps{
  onChange: (url?: string) => void
  value: string
  endpoint: "messageFile" | "serverImage"
}
function FileUpload({onChange, value, endpoint}: FileUploadProps) {
  const [fileType, setFileType] = React.useState<string | null>(null);

  const deleteValue = async (value:any) => {
    onChange("")
    await axios.delete("api/uploadthing", {
      data: {
        url: value,
      },
    });
  };

  if(value && fileType !== "pdf"){
    return(
      <div className='relative h-20 w-20'>
        <Image
        fill
        src={value}
        alt='Image'
        className='rounded-full'
        />
        <button onClick={() => deleteValue(value)} className='bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm hover:cursor-pointer hover:bg-rose-600' type='button' >
          <X className='h-4 w-4'/>
        </button>
      </div>
    )
  }

  if(value && fileType === "pdf"){
    return (
      <div className='relative flex items-center p-2 mt-2 rounded-md bg-background/10'>
        <FileIcon className='h-10 w-10 fill-indigo-200 stroke-indigo-400' />
        <a href={value} target='_blank' rel='noopener noreferrer' className='relative ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline wrap-break-word max-w-[400px]'>
          {value}
        </a>
        <button onClick={() => deleteValue(value)} className='bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2.5 shadow-sm hover:cursor-pointer hover:bg-rose-600' type='button' >
          <X className='h-4 w-4'/>
        </button>

      </div>
    )
  }

  return (
      <UploadDropzone
      endpoint={endpoint}
      onBeforeUploadBegin={(files) => {
        const file = files[0];

        // Detect file type correctly
        const type = file.name?.split(".").pop()
        setFileType(type!)

        return files; // must return files
      }}

      onClientUploadComplete={(res) => {
        onChange(res?.[0].ufsUrl)
      }}
      onUploadError={(error: Error) => {
        console.log(error)
      }}
       />
  )
}

export default FileUpload
