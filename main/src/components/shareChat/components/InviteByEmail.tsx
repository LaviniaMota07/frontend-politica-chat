import { UserPlus, X } from "lucide-react";
import type { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { useState, useEffect } from "react";
import { useFetch } from "../../../hooks/useFetch";

interface UserSuggestion {
  email: string;
  name: string;
  userId: number;
}

interface InviteByEmailProps {
  register: UseFormRegister<any>;
  error?: string;
  setValue: UseFormSetValue<any>;
}

const InviteByEmail = ({ register, error, setValue }: InviteByEmailProps) => {
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

  function handleSelectUser(user: UserSuggestion) {
    setSelectedUser(user);
    setValue("email", user.email);
    setValue("userId", user.userId.toString());
    setInputValue(user.email);
    setShowSuggestions(false);
  }

  function handleClearSelection() {
    setSelectedUser(null);
    setValue("email", "");
    setValue("userId", "");
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
    <div className="chat-share-invite-area">
      <span className="chat-share-invite-label">Adicionar por e-mail</span>
      <div className="chat-share-invite-row">
        <div className="chat-share-input-wrapper" style={{ position: "relative", flex: 1 }}>
          <input
            type="email"
            className="chat-share-invite-input"
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
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px"
              }}
            >
              <X size={14} />
            </button>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <ul
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                marginTop: "4px",
                maxHeight: "200px",
                overflowY: "auto",
                zIndex: 10,
                listStyle: "none",
                padding: "4px 0",
                margin: 0,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
            >
              {suggestions.map((user) => (
                <li
                  key={user.userId}
                  onClick={() => handleSelectUser(user)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                >
                  <span style={{ fontWeight: 500, fontSize: "14px" }}>{user.name}</span>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>{user.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" className="chat-share-invite-btn">
          <UserPlus size={15} />
          Adicionar
        </button>
      </div>
      {error && <p className="chat-share-invite-error">{error}</p>}
    </div>
  );
};

export default InviteByEmail;
