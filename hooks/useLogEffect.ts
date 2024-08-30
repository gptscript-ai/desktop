import { useEffect } from 'react';

export function useLogEffect(...args: any[]) {
  useEffect(() => {
    console.log(...args);
  }, [...args]);
}
