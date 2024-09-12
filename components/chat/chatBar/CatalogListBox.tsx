import { useDebouncedValue } from '@/hooks/useDebounce';
import {
  FeaturedTool,
  FeaturedToolList,
  FeaturedToolsByCategory,
} from '@/model/tools';
import {
  Listbox,
  ListboxItem,
  ListboxSection,
  Spinner,
  Tooltip,
} from '@nextui-org/react';
import Fuse from 'fuse.js';
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

const fuseOptions = {
  keys: ['tool.name', 'tool.description', 'tool.url', 'tool.tags', 'category'],
  threshold: 0.3,
};

const itemKey = (index: number) => `catalog-item-${index}`;

interface CatalogListboxProps {
  query?: string;
  loading?: string | null;
  equippedTools: string[];
  onAddTool: (tool: string) => void;
  onUncapturedKeyDown?: (e: React.KeyboardEvent) => void;
}

export type ToolCatalogRef = { focus: () => void };

export const CatalogListBox = forwardRef<ToolCatalogRef, CatalogListboxProps>(
  function CatalogListBox(props, ref) {
    const { query, loading, equippedTools, onAddTool, onUncapturedKeyDown } =
      props;

    const debouncedQuery = useDebouncedValue(query || '', 250);

    const featuredResults = useMemo(() => {
      if (debouncedQuery.trim().length <= 0)
        return Object.fromEntries(FeaturedToolsByCategory);

      const fuse = new Fuse(
        FeaturedToolList.map((tool) => ({ tool, category: tool.category })),
        fuseOptions
      );
      const results = fuse.search(debouncedQuery).map((result) => result.item);

      results.reverse();

      return results.reduce(
        (acc, { tool, category }) => {
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(tool);
          return acc;
        },
        {} as Record<string, FeaturedTool[]>
      );
    }, [debouncedQuery]);

    const handleKeyDown = (event: React.KeyboardEvent) => {
      // This allows the user to use the arrow keys to navigate the catalog
      // while still allowing them to forward unused keys to external components
      switch (event.key) {
        case 'Enter':
        case 'ArrowUp':
        case 'ArrowDown':
          break;
        default:
          onUncapturedKeyDown?.(event);
          break;
      }
    };

    const equippedToolsRef = useRef<string[]>(equippedTools);
    equippedToolsRef.current = equippedTools;

    const { resultsWithIndexes, lastIndex } = useMemo(() => {
      let index = 0;
      const featuredCategories = Object.entries(featuredResults);
      const resultsWithIndexes = featuredCategories.map(
        ([category, tools]) =>
          [
            category,
            tools.map((tool) => ({ ...tool, index: index++ })),
          ] as const
      );

      const reversed = resultsWithIndexes
        .flatMap(([, tools]) => tools)
        .reverse();
      let lastIndex: number | undefined;
      for (const item of reversed) {
        if (!equippedToolsRef.current.includes(item.url)) {
          lastIndex = item.index;
          break;
        }
      }

      return { resultsWithIndexes, lastIndex };
    }, [featuredResults]);

    const [focusedItem, setFocusedItem] = useState<number | null>(null);

    const lastIndexRef = useRef<number | undefined>(lastIndex);
    lastIndexRef.current = lastIndex;
    useImperativeHandle(ref, () => ({
      focus: () =>
        lastIndexRef.current != null &&
        focusElement(itemKey(lastIndexRef.current)),
    }));

    return (
      <Listbox
        aria-label={'catalog'}
        variant={'flat'}
        disallowEmptySelection
        selectionMode={'single'}
        disabledKeys={equippedTools}
        selectedKeys={equippedTools}
        onSelectionChange={(selected) => {
          if (selected === 'all') return;
          setFocusedItem(null);
          onAddTool(String(Array.from(selected).pop()) ?? null);
        }}
        onKeyDown={handleKeyDown}
      >
        {resultsWithIndexes.map(([category, tools]) => (
          <ListboxSection
            aria-label={`catalog-section-${category}`}
            key={category}
            title={category}
            showDivider={true}
          >
            {tools.map((tool) => (
              <ListboxItem
                aria-label={itemKey(tool.index)}
                startContent={
                  loading === tool.url ? <Spinner size="sm" /> : tool.icon
                }
                isReadOnly={!!loading}
                id={itemKey(tool.index)}
                key={tool.url} // Using tool URL as the unique key
                onFocus={() => setFocusedItem(tool.index)}
              >
                <Tooltip
                  content={tool.description}
                  placement="right"
                  isOpen={focusedItem === tool.index}
                  onOpenChange={(open) =>
                    setFocusedItem(open ? tool.index : null)
                  }
                  closeDelay={0.5}
                  classNames={{
                    content: 'max-w-[250px]',
                  }}
                >
                  {tool.name}
                </Tooltip>
              </ListboxItem>
            ))}
          </ListboxSection>
        ))}
      </Listbox>
    );
  }
);

function focusElement(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  element.focus();
}
