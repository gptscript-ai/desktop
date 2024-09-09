import { useEffect } from 'react';

export function useKeyEvent(config: {
  key: string | string[];
  onKeyEvent: (e: KeyboardEvent) => void;
  disable?: boolean;
  keyAction?: 'keyup' | 'keydown';
}) {
  const {
    disable = false,
    key,
    onKeyEvent,
    keyAction = 'keyup',
  } = config || {};

  const keys = Array.isArray(key) ? key : [key];

  useEffect(() => {
    if (disable) return;

    const handler = (e: KeyboardEvent) => {
      if (keys.includes(e.key)) {
        onKeyEvent(e);
      }
    };

    document.addEventListener(keyAction, handler);

    return () => {
      document.removeEventListener(keyAction, handler);
    };
  }, [disable, onKeyEvent, keyAction, ...keys]);
}
