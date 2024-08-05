import { createContext, useState, useEffect } from 'react';
import { Me, getMe } from '@/actions/me/me';

interface AuthContextProps{
    children: React.ReactNode
}

interface AuthContextState {
    authenticated: boolean; setAuthenticated: (authenticated: boolean) => void;
    me: Me | null; setMe: React.Dispatch<React.SetStateAction<Me | null>>;
}

const AuthContext = createContext<AuthContextState>({} as AuthContextState);
const AuthContextProvider: React.FC<AuthContextProps> = ({children}) => {
    const [authenticated, setAuthenticated] = useState(false);
    const [me, setMe] = useState<Me | null>(null);

    useEffect(() => {
        setAuthenticated(document && document?.cookie?.includes('gateway_token'));
        if (document && document?.cookie?.includes('gateway_token')) {
            getMe().then((me) => {setMe(me)});
        }
    }, []);

    useEffect(() => {
        if (!authenticated) setMe(null);
        else if (!me) getMe().then((me) => {setMe(me)});
    }, [authenticated]);

    return (
        <AuthContext.Provider 
            value={{ 
                authenticated, setAuthenticated,
                me, setMe
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthContextProvider };
