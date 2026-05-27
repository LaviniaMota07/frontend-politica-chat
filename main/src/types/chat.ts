export interface Chat {
    chatId:string
    title:string
    userId:number
    createdAt:string
    lastUpdateAt:string
    ownerName?: string
    roleChatId?: number
    typeAccess?: string
}

export interface ChatListResponse {
    data: Chat[]
    finished: boolean
}