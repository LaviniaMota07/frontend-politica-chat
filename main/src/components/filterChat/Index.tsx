import { useEffect, useRef, useState } from 'react';
import { Building2, MonitorCog } from 'lucide-react';
import { useScrolling } from '../../hooks/useScrolling';
import { chatStyles } from '../../utils/tailwindStyles';

export interface FilterItem {
  itemNm: string;
  itemId: number;
}

interface FilterChatProps {
  title: string;
  icon?: 'building' | 'monitor';
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedItems: number[];
  onItemsChange: (items: number[]) => void;
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
  }, [fetchItems]);

  // Paginação com scroll
  useScrolling(
    scrollContainerRef,
    async () => {
      if (!finish) {
        const lastItemId = items[items.length - 1].itemId;
        const newItems = await fetchItems(lastItemId);
        setItems((prev) => mergeUniqueItems(prev, newItems.data));
        setFinish(newItems.finish)
      }
    },
    { threshold: 100 }
  );

  const visibleItems = getVisibleItems(items, searchValue);
  const summary = getSelectionSummary(selectedItems, items, allOptionLabel);
  const count = selectedItems.length;

  function handleItemChange(itemId: number) {
    onItemsChange(getNextSelection(selectedItems, itemId));
  }

  return (
    <details className={chatStyles.filterMenu}>
      <summary
        className={chatStyles.filterSummary}
        title={`${title}: ${summary}`}
        aria-label={`Filtrar por ${title.toLowerCase()}. Seleção atual: ${summary}`}
      >
        {icon === 'building' ? <Building2 size={15} /> : <MonitorCog size={15} />}
        <span>{title}</span>
        {count > 0 && <strong>{count}</strong>}
      </summary>

      <div className={chatStyles.filterOptions} ref={scrollContainerRef}>
        <input
          className="mb-1 h-9 w-full rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-body)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(168,101,53,0.12)]"
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={`Buscar ${title.toLowerCase()}`}
          aria-label={`Buscar ${title.toLowerCase()}`}
        />

        <label className={chatStyles.filterOption}>
          <input
            type="checkbox"
            checked={selectedItems.length === 0}
            onChange={() => onItemsChange([])}
          />
          <span>{allOptionLabel}</span>
        </label>

        {visibleItems.map((item) => (
          <label className={chatStyles.filterOption} key={item.itemId}>
            <input
              type="checkbox"
              checked={selectedItems.includes(item.itemId)}
              onChange={() => handleItemChange(item.itemId)}
            />
            <span>{item.itemNm}</span>
          </label>
        ))}

        {visibleItems.length === 0 && (
          <span className="px-3 py-2 text-sm text-[var(--text-muted)]">
            Nenhum {title.toLowerCase()} encontrado
          </span>
        )}
      </div>
    </details>
  );
}

function getNextSelection(currentSelection: number[], selectedOption: number) {
  const nextSelection = currentSelection.includes(selectedOption)
    ? currentSelection.filter((option) => option !== selectedOption)
    : [...currentSelection, selectedOption];

  return nextSelection;
}

function getSelectionSummary(selection: number[], items: FilterItem[], allOption: string) {
  if (selection.length === 0) {
    return allOption;
  }

  const selectedLabels = selection
    .map((selectedId) => items.find((item) => item.itemId === selectedId)?.itemNm)
    .filter((label): label is string => Boolean(label));

  if (selectedLabels.length === 0) {
    return `${selection.length} selecionado${selection.length > 1 ? 's' : ''}`;
  }

  if (selectedLabels.length <= 2) {
    return selectedLabels.join(', ');
  }

  return `${selectedLabels.length} selecionados`;
}

function getVisibleItems(items: FilterItem[], searchValue: string) {
  const normalizedSearch = searchValue.trim().toLowerCase();

  if (!normalizedSearch) {
    return items;
  }

  return items.filter((item) => item.itemNm.toLowerCase().includes(normalizedSearch));
}

function mergeUniqueItems(currentItems: FilterItem[], nextItems: FilterItem[]) {
  const itemsById = new Map<number, FilterItem>();

  for (const item of [...currentItems, ...nextItems]) {
    itemsById.set(item.itemId, item);
  }

  return Array.from(itemsById.values());
}
