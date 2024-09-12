declare global {
  interface Window {
    electronAPI: {
      openFile: (path: string) => void;
      saveFile: (content: string) => void;
    };
  }
}

export {};
