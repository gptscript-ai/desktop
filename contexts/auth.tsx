import { createContext, useState, useEffect } from 'react';
import { Me, getMe } from '@/actions/me/me';
import { loginThroughTool } from '@/actions/auth/auth';

interface AuthContextProps {
  children: React.ReactNode;
}

interface AuthContextState {
  authenticated: boolean;
  setAuthenticated: (authenticated: boolean) => void;
  me: Me | null;
  setMe: React.Dispatch<React.SetStateAction<Me | null>>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextState>({} as AuthContextState);
const AuthContextProvider: React.FC<AuthContextProps> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthenticated(document && document?.cookie?.includes('gateway_token'));
    if (!document || !document.cookie?.includes('gateway_token')) {
      loginThroughTool().then(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) setMe(null);
    else if (!me)
      getMe().then((me) => {
        setMe(me);
      });
  }, [me, loading]);

  return (
    <AuthContext.Provider
      value={{
        loading,
        authenticated,
        setAuthenticated,
        me,
        setMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextProvider };
