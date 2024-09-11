declare global {
  interface Window {
    electronAPI: {
      openFile: (path: string) => void;
    };
  }
}

export {};
