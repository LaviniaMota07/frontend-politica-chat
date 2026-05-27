import { ArrowRight, Bot } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import FilterChat, { type FilterItem } from '../../../components/filterChat/Index';
import { chatStyles } from '../../../utils/tailwindStyles';

type FetchFilterItems = (lastItemId?: number) => Promise<{ data: FilterItem[]; finish: boolean }>;

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isSending?: boolean;
  sourcesCount?: number;
  selectedDepartments?: number[];
  departments: string[];
  onDepartmentsChange: (departments: number[]) => void;
  fetchDepartments: FetchFilterItems;
  selectedSystems?: number[];
  systems: string[];
  onSystemsChange: (systems: number[]) => void;
  fetchSystems: FetchFilterItems;
  selectedAiProvider: number;
  aiProviders: number[];
  onAiProviderChange: (provider: number) => void;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  isSending = false,
  sourcesCount = 0,
  selectedDepartments = [],
  departments,
  onDepartmentsChange,
  fetchDepartments,
  selectedSystems = [],
  systems,
  onSystemsChange,
  fetchSystems,
  selectedAiProvider,
  aiProviders,
  onAiProviderChange,
}: ChatInputProps) {

  const sourcesLabel = sourcesCount > 0
    ? `${sourcesCount} fonte${sourcesCount > 1 ? 's' : ''}`
    : 'Fontes aguardando backend';

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [systemSearch, setSystemSearch] = useState('');

  useEffect(() => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  }, [value]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  }

  return (
    <div className={chatStyles.inputShell}>
      <div className={chatStyles.inputWrapper}>
        <div className={chatStyles.filterStrip} aria-label="Filtros da conversa">

          <FilterChat
            title="Departamentos"
            icon="building"
            searchValue={departmentSearch}
            onSearchChange={setDepartmentSearch}
            selectedItems={selectedDepartments}
            onItemsChange={onDepartmentsChange}
            fetchItems={fetchDepartments}
            allOptionLabel={departments[0] ?? 'Todos os departamentos'}
          />

          <FilterChat
            title="Sistemas"
            icon="monitor"
            searchValue={systemSearch}
            onSearchChange={setSystemSearch}
            selectedItems={selectedSystems}
            onItemsChange={onSystemsChange}
            fetchItems={fetchSystems}
            allOptionLabel={systems[0] ?? 'Todos os sistemas'}
          />

          <details className={chatStyles.filterMenu}>
            <summary
              className={chatStyles.filterSummary}
              title={`IA: ${selectedAiProvider}`}
              aria-label={`Escolher IA para responder. Seleção atual: ${selectedAiProvider}`}
            >
              <Bot size={15} />
              <span>{selectedAiProvider}</span>
            </summary>

            <div className={chatStyles.filterOptions}>
              {aiProviders.map((provider) => (
                <label className={chatStyles.filterOption} key={provider}>
                  <input
                    type="radio"
                    name="chat-ai-provider"
                    checked={selectedAiProvider === provider}
                    onChange={() => onAiProviderChange(provider)}
                  />
                  <span>{provider}</span>
                </label>
              ))}
            </div>
          </details>
        </div>

        <textarea
          ref={inputRef}
          className={chatStyles.textArea}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva sua mensagem..."
          rows={1}
        />

        <div className={chatStyles.inputActions}>
          <span className="text-xs font-bold text-slate-500">{sourcesLabel}</span>

          <button
            type="button"
            className={chatStyles.sendButton}
            onClick={onSend}
            disabled={isSending || !value.trim()}
            aria-label={isSending ? 'Enviando mensagem' : 'Enviar mensagem'}
          >
            <ArrowRight size={18} strokeWidth={2.6} />
          </button>
        </div>
      </div>
    </div>
  );
}
