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
        <section className="rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-5 shadow-[0_18px_50px_rgba(31,29,25,0.08)]">
            <h3 className="mb-4 font-[var(--heading)] text-lg font-extrabold tracking-[-0.04em] text-[var(--text-primary)]">Pessoas com acesso</h3>
            <ul className="flex max-h-[520px] flex-col gap-3 overflow-y-auto">
                {sharedUsers.map((user) => (
                <li key={user.userId} className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-body)] p-4">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border-neutral)] bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent-strong)]">
                    {user.userNm.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-1">
                    <span className="font-bold text-[var(--text-primary)]">{user.userNm}</span>
                    <span className="text-xs text-[var(--text-secondary)]">{user.email}</span>
                    </div>

                    <span
                    className={cn(
                        'mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em]',
                        user.roleChatId === 2
                        ? 'border border-[var(--border-neutral)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                        : 'border border-emerald-200 bg-emerald-50 text-emerald-800',
                    )}
                    >
                    {user.roleChatId === 2 ? 'Pode editar' : 'Somente leitura'}
                    </span>

                    <div className="mt-3">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-800 transition hover:bg-red-100"
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