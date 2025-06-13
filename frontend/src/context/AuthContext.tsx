import { createContext } from 'react';
import { StudentData } from '../components/types';
export interface AuthContextType {
    accessToken: string | null;
    refreshToken: string | null;
    formData: StudentData | null;
    setFormData: (data: StudentData | null) => void;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    refreshAccessToken: () => Promise<string | null>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export default AuthContext;


