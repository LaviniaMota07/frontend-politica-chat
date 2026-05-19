import { ArrowRight, Bot, Building2, MonitorCog } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import type { AiProvider } from '../types/chat.types';

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
  selectedAiProvider: AiProvider;
  aiProviders: AiProvider[];
  onAiProviderChange: (provider: AiProvider) => void;
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
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const departmentSummary = getSelectionSummary(selectedDepartments, departments[0]);
  const systemSummary = getSelectionSummary(selectedSystems, systems[0]);
  const departmentCount = getActiveSelectionCount(selectedDepartments, departments[0]);
  const systemCount = getActiveSelectionCount(selectedSystems, systems[0]);

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

  function handleDepartmentChange(department: string) {
    onDepartmentsChange(getNextSelection(selectedDepartments, department, departments[0]));
  }

  function handleSystemChange(system: string) {
    onSystemsChange(getNextSelection(selectedSystems, system, systems[0]));
  }

  return (
    <div className="chat-input-shell">
      <div className="chat-input-wrapper">
        <div className="chat-filter-strip" aria-label="Filtros da conversa">
          <details className="chat-filter-menu">
            <summary
              className="chat-department-filter"
              title={`Departamentos: ${departmentSummary}`}
              aria-label={`Filtrar por departamento. Seleção atual: ${departmentSummary}`}
            >
              <Building2 size={15} />
              <span>Deptos</span>
              {departmentCount > 0 && <strong>{departmentCount}</strong>}
            </summary>

            <div className="chat-filter-options">
              {departments.map((department) => (
                <label className="chat-filter-option" key={department}>
                  <input
                    type="checkbox"
                    checked={selectedDepartments.includes(department)}
                    onChange={() => handleDepartmentChange(department)}
                  />
                  <span>{department}</span>
                </label>
              ))}
            </div>
          </details>

          <details className="chat-filter-menu">
            <summary
              className="chat-department-filter"
              title={`Sistemas: ${systemSummary}`}
              aria-label={`Filtrar por sistema. Seleção atual: ${systemSummary}`}
            >
              <MonitorCog size={15} />
              <span>Sistemas</span>
              {systemCount > 0 && <strong>{systemCount}</strong>}
            </summary>

            <div className="chat-filter-options">
              {systems.map((system) => (
                <label className="chat-filter-option" key={system}>
                  <input
                    type="checkbox"
                    checked={selectedSystems.includes(system)}
                    onChange={() => handleSystemChange(system)}
                  />
                  <span>{system}</span>
                </label>
              ))}
            </div>
          </details>

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

function getNextSelection(currentSelection: string[], selectedOption: string, allOption: string) {
  if (selectedOption === allOption) {
    return [allOption];
  }

  const withoutAllOption = currentSelection.filter((option) => option !== allOption);
  const nextSelection = withoutAllOption.includes(selectedOption)
    ? withoutAllOption.filter((option) => option !== selectedOption)
    : [...withoutAllOption, selectedOption];

  return nextSelection.length > 0 ? nextSelection : [allOption];
}

function getSelectionSummary(selection: string[], allOption: string) {
  const selectedItems = selection.filter((option) => option !== allOption);

  if (selectedItems.length === 0) {
    return allOption;
  }

  if (selectedItems.length <= 2) {
    return selectedItems.join(', ');
  }

  return `${selectedItems.length} selecionados`;
}

function getActiveSelectionCount(selection: string[], allOption: string) {
  return selection.filter((option) => option !== allOption).length;
}
