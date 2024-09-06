import { useDebouncedValue } from '@/hooks/useDebounce';
import {
  FeaturedTool,
  FeaturedToolList,
  FeaturedToolsByCategory,
} from '@/model/tools';
import {
  Card,
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
  query: string;
  loading?: string | null;
  equippedTools: string[];
  onAddTool: (tool: string) => void;
  onEscape: () => void;
  onUncapturedKeyDown: () => void;
}

export type ToolCatalogRef = { focus: () => void };

/** @deprecated will remove in future PR. Use CatalogListBox from `@/components/chat/chatBar/CatalogListBox.tsx` instead */
export default forwardRef<ToolCatalogRef, CatalogListboxProps>(
  function Catalog(props, ref) {
    const {
      query,
      loading,
      equippedTools,
      onAddTool,
      onEscape,
      onUncapturedKeyDown,
    } = props;

    const debouncedQuery = useDebouncedValue(query, 250);

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
      switch (event.key) {
        case 'Enter':
        case 'ArrowUp':
        case 'ArrowDown':
          break;
        case 'Escape':
          onEscape();
          break;
        default:
          onUncapturedKeyDown();
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

      return {
        resultsWithIndexes,
        lastIndex,
      };
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
      <Card
        className={
          'absolute bottom-14 z-[1000] p-4 max-h-[710px] w-1/2 overflow-auto border-small border-default-200 dark:border-default-100'
        }
      >
        <Listbox
          aria-label={'catalog'}
          variant={'flat'}
          disallowEmptySelection
          selectionMode={'single'}
          shouldFocusWrap={true}
          disabledKeys={equippedTools}
          defaultSelectedKeys={equippedTools}
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
                  isReadOnly={loading !== null}
                  id={itemKey(tool.index)}
                  key={tool.url} // Using tool URL as the unique key
                  value={tool.url}
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
      </Card>
    );
  }
);

function focusElement(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  element.focus();
}
