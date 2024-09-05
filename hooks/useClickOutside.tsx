import { useRef, useEffect } from 'react';

export function useClickOutside({
  onClickOutside,
  method = 'click',
  whitelist,
}: {
  onClickOutside: (e: MouseEvent) => void;
  method?: 'click' | 'mousedown' | 'mouseup';
  whitelist?: HTMLElement[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const whitelistRef = useRef<HTMLElement[]>(whitelist || []);
  whitelistRef.current = whitelist || [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        !whitelistRef.current.some((el) => el.contains(e.target as Node))
      ) {
        onClickOutside(e);
      }
    };

    document.addEventListener(method, handleClickOutside);

    return () => {
      document.removeEventListener(method, handleClickOutside);
      console.log('remove');
    };
  }, [onClickOutside, method]);

  return ref;
}
