import { createContext } from 'react';

export interface AuthContextType {
    token: string | null;
    login: (token:string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export default AuthContext;


