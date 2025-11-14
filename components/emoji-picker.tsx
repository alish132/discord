import { Smile } from 'lucide-react'
import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import Picker from "emoji-picker-react"
import data from "emoji-picker-react"
import { useTheme } from 'next-themes'
import { Theme } from 'emoji-picker-react';

interface EmojiPickerProps {
    onChange: (value: string) => void
}

function EmojiPicker({ onChange }: EmojiPickerProps) {
    const {resolvedTheme} = useTheme()
    const onEmojiClick = (emojiData: any) => {
        onChange(emojiData.emoji);   
    };

    return (
        <div>
            <Popover>
                <PopoverTrigger>
                    <Smile className='text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition' />
                </PopoverTrigger>
                <PopoverContent side='right' sideOffset={40} className='bg-transparent border-none shadow-none drop-shadow-none mb-16'>
                    <Picker theme={resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT} onEmojiClick={onEmojiClick} />
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default EmojiPicker
