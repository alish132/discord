import { Server } from '@/lib/generated/prisma/client';
import {create} from 'zustand'

export type modalType = "createServer" | "invite"

interface ModalData{
    server?: Server
}

interface ModalStore {
    type: modalType | null;
    data: ModalData,
    isOpen: boolean;
    onOpen: (type: modalType, data?:ModalData) => void;
    onClose: () => void
}

export const useModal = create<ModalStore>((set) => ({
    type: null,
    data: {},
    isOpen: false,
    onOpen: (type, data={}) => set({isOpen: true, type:type, data:data}),
    onClose: () => set({type: null, isOpen: false, data:{}})
}))