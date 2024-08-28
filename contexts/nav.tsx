import { createContext, useState } from 'react';

interface NavContextProps {
  children: React.ReactNode;
}

interface NavContextState {
  current: string;
  setCurrent: (current: string) => void;
}

const NavContext = createContext<NavContextState>({} as NavContextState);
const NavContextProvider: React.FC<NavContextProps> = ({ children }) => {
  const [current, setCurrent] = useState('/');

  return (
    <NavContext.Provider
      value={{
        current,
        setCurrent,
      }}
    >
      {children}
    </NavContext.Provider>
  );
};

export { NavContext, NavContextProvider };
