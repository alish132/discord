import { Server, ChannelType, Channel } from '@/lib/generated/prisma/client';
import {create} from 'zustand'

// members = manage members
export type modalType = "createServer" | "invite" | "editServer" | "members" | "createChannel" | "leaveServer" | "deleteServer" | "deleteChannel" | "editChannel" | "messageFile" | "deleteMessage"

interface ModalData{
    server?: Server
    channel?: Channel 
    channelType?: ChannelType,
    apiUrl?: string
    query?: Record<string, any> 
}

interface ModalStore {
    type: modalType | null;
    data: ModalData,
    isOpen: boolean;
    onOpen: (type: modalType, data?:ModalData) => void;
    onClose: () => void,
}

export const useModal = create<ModalStore>((set) => ({
    type: null,
    data: {},
    isOpen: false,
    defaultChannelType: null,
    onOpen: (type, data={}) => set({isOpen: true, type:type, data:data}),
    onClose: () => set({type: null, isOpen: false, data:{}})
}))