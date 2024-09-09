import { useRef, useEffect } from 'react';

export function useClickOutside({
  onClickOutside,
  action = 'click',
  whitelist,
  disable,
}: {
  onClickOutside: (e: MouseEvent) => void;
  action?: 'click' | 'mousedown' | 'mouseup';
  whitelist?: HTMLElement[];
  disable?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disable) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        !whitelist?.some((el) => el.contains(e.target as Node))
      ) {
        onClickOutside(e);
      }
    };

    document.addEventListener(action, handleClickOutside);

    return () => {
      document.removeEventListener(action, handleClickOutside);
    };
  }, [action, onClickOutside, disable, whitelist]);

  return ref;
}
