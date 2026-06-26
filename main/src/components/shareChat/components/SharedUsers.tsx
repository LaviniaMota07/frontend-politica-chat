import { X } from 'lucide-react';
import React, { useEffect, forwardRef, useImperativeHandle } from 'react'
import { useFetch } from '../../../hooks/useFetch';
import { useParams } from 'react-router-dom';

export interface SharedUser {
    userNm: string;
    typeAccess: string;
    roleChatId: number;
    userId: number;
    email: string;
}

export interface SharedUsersHandle {
    addSharedUser: (user: SharedUser) => void;
}

interface SharedUsersProps {
}

const SharedUsers = forwardRef<SharedUsersHandle, SharedUsersProps>((_, ref) => {

    const {chatId} = useParams()

    const [sharedUsers,setSharedUsers] = React.useState<SharedUser[]>([])

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

    function addSharedUser(user: SharedUser) {
        setSharedUsers(prev => [...prev, user])
    }

    useImperativeHandle(ref, () => ({
        addSharedUser
    }))

    useEffect(()=>{
        (async () => {
            if(chatId) {
                const res = await get(`/chat/users/shared?chatId=${chatId}`) as SharedUser[]
               
                setSharedUsers(res)
            }
        })()
    }, [chatId])

    return (
        <section className="chat-share-users-panel">
            <h3 className="chat-share-users-title">Pessoas com acesso</h3>
            <ul className="chat-share-users-list">
                {sharedUsers.map((user) => (
                <li key={user.userId} className="chat-share-user-item">
                    <div className="chat-share-user-avatar">
                    {user.userNm.charAt(0).toUpperCase()}
                    </div>
                    <div className="chat-share-user-info">
                    <span className="chat-share-user-name">{user.userNm}</span>
                    <span className="chat-share-user-email">{user.email}</span>
                    </div>

                    <span
                    className="chat-share-user-status"
                    style={{
                        background: user.roleChatId === 2
                        ? 'rgba(47, 125, 246, 0.14)'
                        : 'rgba(16, 185, 129, 0.14)',
                        color: user.typeAccess === 'edit' ? '#7eb8ff' : '#34d399',
                    }}
                    >
                    {user.roleChatId === 2 ? 'Pode editar' : 'Somente leitura'}
                    </span>

                    <div className="chat-share-user-actions">
                    <button
                        type="button"
                        className="chat-share-user-btn remove"
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
})

SharedUsers.displayName = 'SharedUsers'

export default SharedUsers