import { UserPlus, X } from "lucide-react";
import type { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { useState, useEffect } from "react";
import { useFetch } from "../../../hooks/useFetch";
import type { ShareChatFormData } from "../../../hooks/forms/useShareChatForm";
import { buttonStyles, formStyles } from "../../../utils/tailwindStyles";

interface UserSuggestion {
  email: string;
  name: string;
  userId: number;
}

interface InviteByEmailProps {
  register: UseFormRegister<ShareChatFormData>;
  error?: string;
  setValue: UseFormSetValue<ShareChatFormData>;
  resetSignal?: number;
}

const InviteByEmail = ({ register, error, setValue, resetSignal = 0 }: InviteByEmailProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(null);
  const [inputValue, setInputValue] = useState("");
  const { get } = useFetch();

  useEffect(() => {
    const fetchUsers = async () => {
      if (inputValue.includes("@") && inputValue.length > 1) {
        try {
          const res = await get(`/user/email/${inputValue}`) as UserSuggestion[];
          setSuggestions(res);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Erro ao buscar usuários:", error);
          setSuggestions([]);
        }
      } else {
        setShowSuggestions(false);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue, get]);

  useEffect(() => {
    queueMicrotask(() => {
      setSelectedUser(null);
      setInputValue("");
      setSuggestions([]);
      setShowSuggestions(false);
    });
  }, [resetSignal]);

  function handleSelectUser(user: UserSuggestion) {
    setSelectedUser(user);
    setValue("email", user.email);
    setValue("userId", user.userId);
    setInputValue(user.email);
    setShowSuggestions(false);
  }

  function handleClearSelection() {
    setSelectedUser(null);
    setValue("email", "");
    setValue("userId", 0);
    setInputValue("");
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInputValue(value);
    if (!selectedUser) {
      setValue("email", value);
    }
  }

  return (
    <div className="px-6 pb-5">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.1em] text-slate-500">Adicionar por e-mail</span>
      <div className="flex gap-3 max-[640px]:flex-col">
        <div className="relative flex-1">
          <input
            type="email"
            className={formStyles.input}
            placeholder="nome@empresa.com"
            aria-label="E-mail para convite"
            value={inputValue}
            disabled={!!selectedUser}
            {...register("email", {
              onChange: handleInputChange
            })}
          />
          {selectedUser && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <ul
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 max-h-52 list-none overflow-y-auto rounded-2xl border border-white/10 bg-[#101827] p-1 shadow-[0_18px_44px_rgba(0,0,0,0.35)]"
            >
              {suggestions.map((user) => (
                <li
                  key={user.userId}
                  onClick={() => handleSelectUser(user)}
                  className="flex cursor-pointer flex-col gap-0.5 rounded-xl px-3 py-2 transition hover:bg-white/[0.06]"
                >
                  <span className="text-sm font-bold text-slate-100">{user.name}</span>
                  <span className="text-xs text-slate-500">{user.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" className={buttonStyles.primary}>
          <UserPlus size={15} />
          Adicionar
        </button>
      </div>
      {error && <p className={formStyles.error}>{error}</p>}
    </div>
  );
};

export default InviteByEmail;
