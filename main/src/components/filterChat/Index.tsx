import { useEffect, useRef, useState } from 'react';
import { Building2, MonitorCog } from 'lucide-react';
import { useScrolling } from '../../hooks/useScrolling';

export interface FilterItem {
  itemNm: string;
  itemId: number;
}

interface FilterChatProps {
  title: string;
  icon?: 'building' | 'monitor';
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedItems: string[];
  onItemsChange: (items: string[]) => void;
  fetchItems: (lastItemId?: number) => Promise<{ data: { itemNm: string; itemId: number }[], finish: boolean }>;
  allOptionLabel?: string;
}

export default function FilterChat({
  title,
  icon = 'building',
  searchValue,
  onSearchChange,
  selectedItems,
  onItemsChange,
  fetchItems,
  allOptionLabel = 'Todos',
}: FilterChatProps) {
  const [items, setItems] = useState<FilterItem[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [finish, setFinish] = useState(true);

  // Carregar itens iniciais quando o componente montar
  useEffect(() => {
    (async () => {
      const fetched = await fetchItems();
      setItems(fetched.data);
      setFinish(fetched.finish)
    })();
  }, []);

  // Resetar quando a busca mudar
  useEffect(() => {
    if (searchValue) {
      setFinish(false)
    }
  }, [searchValue]);

  // Paginação com scroll
  useScrolling(
    scrollContainerRef,
    async () => {
      if (!finish) {
        const lastItemId = items[items.length - 1].itemId;
        const newItems = await fetchItems(lastItemId);
        setItems((prev) => [...prev, ...newItems.data]);
        setFinish(newItems.finish)
      }
    },
    { threshold: 100 }
  );

  const summary = getSelectionSummary(selectedItems, allOptionLabel);
  const count = getActiveSelectionCount(selectedItems, allOptionLabel);

  function handleItemChange(itemName: string) {
    onItemsChange(getNextSelection(selectedItems, itemName, allOptionLabel));
  }

  return (
    <details className="chat-filter-menu">
      <summary
        className="chat-department-filter"
        title={`${title}: ${summary}`}
        aria-label={`Filtrar por ${title.toLowerCase()}. Seleção atual: ${summary}`}
      >
        {icon === 'building' ? <Building2 size={15} /> : <MonitorCog size={15} />}
        <span>{title}</span>
        {count > 0 && <strong>{count}</strong>}
      </summary>

      <div className="chat-filter-options" ref={scrollContainerRef}>
        <input
          className="chat-filter-search"
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={`Buscar ${title.toLowerCase()}`}
          aria-label={`Buscar ${title.toLowerCase()}`}
        />

        {items.map((item) => (
          <label className="chat-filter-option" key={item.itemId}>
            <input
              type="checkbox"
              checked={selectedItems.includes(item.itemNm)}
              onChange={() => handleItemChange(item.itemNm)}
            />
            <span>{item.itemNm}</span>
          </label>
        ))}

        {items.length === 0 && (
          <span className="chat-filter-empty">
            Nenhum {title.toLowerCase()} encontrado
          </span>
        )}
      </div>
    </details>
  );
}

function getNextSelection(
  currentSelection: string[],
  selectedOption: string,
  allOption: string
) {
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
