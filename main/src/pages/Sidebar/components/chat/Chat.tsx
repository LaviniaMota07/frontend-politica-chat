import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDown, ChevronRight, MessageSquare } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { NavLink } from "react-router-dom"
import z from "zod"
import type { Chat } from "../../../../types/chat"
import { useScrolling } from "../../../../hooks/useScrolling"

interface ChatMenuProp {
    handleGetChat:(lastChatId?:string)=>Promise<{data:Chat[],finished:boolean}>
}

const searchSchema = z.object({
    query: z.string().max(150, "Nome do chat não pode ser maior que 150 caracteres"),
})


const ChatMenu = ({handleGetChat}:ChatMenuProp) => {
        
    const [chats,setChats] = useState<Chat[]>([])
    const [isConversationHistoryOpen, setIsConversationHistoryOpen] = useState(false)
    const scrollContainerRef = useRef<HTMLElement>(null)
    const finished = useRef(false)


    // preciso fazer uma query quando for buscar os chats pelo title
    const {register,formState:{errors}} = useForm({
        resolver: zodResolver(searchSchema),
        defaultValues:{
            query:""
        }
    })

    useEffect(()=>{
        (async ()=>{
            if(finished.current) return

            const result = await handleGetChat()
            setChats(result.data)
        })()
    },[])

    // Recarregar chats quando um novo chat for criado ou atualizado
    useEffect(() => {
        const handleChatCreated = () => {
            (async () => {
                finished.current = false
                const result = await handleGetChat()
                setChats(result.data)
            })()
        }

        const handleChatUpdated = () => {
            (async () => {
                const result = await handleGetChat()
                setChats((prev) => {
                    // Se já temos os chats, apenas atualizar o título se necessário
                    if (prev.length > 0) {
                        return result.data
                    }
                    return result.data
                })
            })()
        }

        window.addEventListener('chatCreated', handleChatCreated)
        window.addEventListener('chatUpdated', handleChatUpdated)

        return () => {
            window.removeEventListener('chatCreated', handleChatCreated)
            window.removeEventListener('chatUpdated', handleChatUpdated)
        }
    }, [handleGetChat])


    useScrolling(
        scrollContainerRef,
        async () => {
            if (chats.length > 0 && !finished.current) {
                const lastChatId = chats[chats.length - 1].chatId
                const newChats = await handleGetChat(lastChatId)
                setChats((prev) => [...prev, ...newChats.data])
                finished.current = newChats.finished
            }
        },
        { threshold: 100 }
    )
   
    
    return (
    <section className="sidebar-history" aria-label="Histórico de conversas">
        <button
            type="button"
            className="sidebar-history-toggle"
            onClick={() => setIsConversationHistoryOpen((current) => !current)}
            aria-expanded={isConversationHistoryOpen}
        >
            <span>Histórico de Conversas</span>
            {isConversationHistoryOpen ? (
            <ChevronDown size={16} strokeWidth={1.8} />
            ) : (
            <ChevronRight size={16} strokeWidth={1.8} />
            )}
        </button>

        {isConversationHistoryOpen && (
            <>
            <label className="sidebar-history-search">
                <input
                type="search"
                placeholder="Buscar conversa"
                {...register("query")}
                />
            </label>

            {errors.query && <p>{errors.query.message}</p>}

            <nav className="sidebar-history-list" ref={scrollContainerRef}>
                {chats.map((item) => (
                    <NavLink to={`/chat/${item.chatId}`} className="sidebar-history-link" key={item.chatId}>
                        <MessageSquare size={17} strokeWidth={1.8} />
                        <span>{item.title}</span>
                    </NavLink>
                ))}
            </nav>

            {chats.length === 0 && (
                <p className="sidebar-history-empty">Nenhuma conversa encontrada.</p>
            )}
            </>
        )}
    </section>
  )
}

export default ChatMenu