import { X } from 'lucide-react';
import { useEffect, type Dispatch, type SetStateAction } from 'react'
import { useFetch } from '../../../hooks/useFetch';
import { useParams } from 'react-router-dom';
import { cn } from '../../../utils/classNames';

export interface SharedUser {
    userNm: string;
    typeAccess: string;
    roleChatId: number;
    userId: number;
    email: string;
}

interface SharedUsersProps {
    sharedUsers: SharedUser[];
    setSharedUsers: Dispatch<SetStateAction<SharedUser[]>>;
}

const SharedUsers = ({ sharedUsers, setSharedUsers }: SharedUsersProps) => {
    const {chatId} = useParams()

    const {get, del} = useFetch()

    async function handleRemoveUser (userId: number) {
        const res = await del(`/chat/share?chatId=${chatId}&targetUserId=${userId}`,{
            successAlert: {
                title: 'Sucesso',
                message: 'Usuário removido com sucesso!'
            }
        })

        if(res) {
            setSharedUsers(prev => prev.filter(user => user.userId !== userId))
        }

    }

    useEffect(()=>{
        (async () => {
            if(chatId) {
                const res = await get(`/chat/users/shared?chatId=${chatId}`) as SharedUser[] | null
               
                setSharedUsers(res ?? [])
            }
        })()
    }, [chatId, get, setSharedUsers])

    return (
        <section className="rounded-3xl border border-white/10 bg-[#0c1628] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
            <h3 className="mb-4 text-lg font-black tracking-[-0.04em] text-slate-50">Pessoas com acesso</h3>
            <ul className="flex max-h-[520px] flex-col gap-3 overflow-y-auto">
                {sharedUsers.map((user) => (
                <li key={user.userId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500 text-sm font-black text-white">
                    {user.userNm.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-1">
                    <span className="font-black text-slate-100">{user.userNm}</span>
                    <span className="text-xs text-slate-500">{user.email}</span>
                    </div>

                    <span
                    className={cn(
                        'mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.06em]',
                        user.roleChatId === 2
                        ? 'bg-blue-500/15 text-blue-200'
                        : 'bg-emerald-500/15 text-emerald-200',
                    )}
                    >
                    {user.roleChatId === 2 ? 'Pode editar' : 'Somente leitura'}
                    </span>

                    <div className="mt-3">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl border border-red-300/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200 transition hover:bg-red-500/15"
                        onClick={() => handleRemoveUser(user.userId)}
                        aria-label={`Remover ${user.userNm}`}
                    >
                        <X size={13} />
                        Remover
                    </button>
                    </div>
                </li>
                ))}
            </ul>
        </section>
  )
}

export default SharedUsers