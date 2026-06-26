import { ArrowRight, Bot } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { DepartmentResponse, SystemResponse } from '../types/chat.types';
import FilterChat, { type FilterItem } from '../../../components/filterChat/Index';
import { useFetch } from '../../../hooks/useFetch';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isSending?: boolean;
  sourcesCount?: number;
  selectedDepartments?: string[];
  departments: string[];
  onDepartmentsChange: (departments: string[]) => void;
  selectedSystems?: string[];
  systems: string[];
  onSystemsChange: (systems: string[]) => void;
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
  selectedDepartments = ['Todos os departamentos'],
  departments,
  onDepartmentsChange,
  selectedSystems = ['Todos os sistemas'],
  systems,
  onSystemsChange,
  selectedAiProvider,
  aiProviders,
  onAiProviderChange,
}: ChatInputProps) {

  const { get } = useFetch();

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

  async function handleGetDepartment(lastIdDepartment?: number): Promise<{ data: FilterItem[], finish: boolean }> {

    let url = `/department/scrolling`

    if (lastIdDepartment) {
      url += `?departmentId=${lastIdDepartment}`
    }

    const response = await get(url) as { data: DepartmentResponse[], finish: boolean } | null
    if (response) {
      const data = response.data.map((department: DepartmentResponse): FilterItem => {
        return {
          itemId: department.departmentId,
          itemNm: department.departmentNm
        }
      })
      return { data, finish: response.finish }
    }

    return { data: [], finish: true }

  }

  async function handleGetSystem(lastIdSystem?: number): Promise<{ data: FilterItem[], finish: boolean }> {

    let url = `/systems/scrolling`

    if (lastIdSystem) {
      url += `?systemId=${lastIdSystem}`
    }

    const response = await get(url) as { data: SystemResponse[], finish: boolean } | null

    if (response) {
      const data = response.data.map((department: SystemResponse): FilterItem => {
        return {
          itemId: department.systemId,
          itemNm: department.systemNm
        }
      })
      return { data, finish: response.finish }
    }

    return { data: [], finish: true }

  }

  return (
    <div className="chat-input-shell">
      <div className="chat-input-wrapper">
        <div className="chat-filter-strip" aria-label="Filtros da conversa">

          <FilterChat
            title="Departamentos"
            icon="building"
            searchValue={departmentSearch}
            onSearchChange={setDepartmentSearch}
            selectedItems={selectedDepartments}
            onItemsChange={onDepartmentsChange}
            fetchItems={handleGetDepartment}
            allOptionLabel={departments[0]}
          />

          <FilterChat
            title="Sistemas"
            icon="monitor"
            searchValue={systemSearch}
            onSearchChange={setSystemSearch}
            selectedItems={selectedSystems}
            onItemsChange={onSystemsChange}
            fetchItems={handleGetSystem}
            allOptionLabel={systems[0]}
          />

          <details className="chat-filter-menu">
            <summary
              className="chat-department-filter"
              title={`IA: ${selectedAiProvider}`}
              aria-label={`Escolher IA para responder. Seleção atual: ${selectedAiProvider}`}
            >
              <Bot size={15} />
              <span>{selectedAiProvider}</span>
            </summary>

            <div className="chat-filter-options chat-provider-options">
              {aiProviders.map((provider) => (
                <label className="chat-filter-option" key={provider}>
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
          className="chat-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva sua mensagem..."
          rows={1}
        />

        <div className="chat-input-actions">
          <span className="chat-sources-counter">{sourcesCount} fontes</span>

          <button
            type="button"
            className="chat-send-button"
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
