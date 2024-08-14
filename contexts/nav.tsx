import { createContext, useState, useEffect } from 'react';
import { Me, getMe } from '@/actions/me/me';
import { loginThroughTool } from '@/actions/auth/auth';

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
