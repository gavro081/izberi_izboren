import { OverridableTokenClientConfig } from "@react-oauth/google";
import { createContext, Dispatch, SetStateAction } from "react";
import { StudentData } from "../components/types";

export interface User {
	full_name: string;
	user_type: string;
}
export interface AuthContextType {
	accessToken: string | null;
	formData: StudentData | null;
	setFormData: (data: StudentData | null) => void;
	user: User | null;
	login: (accessToken: string, refreshToken: string, userData: User) => void;
	logout: () => void;
	isAuthenticated: boolean;
	loading: boolean;
	sessionInitialized: boolean;
	setUser: Dispatch<SetStateAction<User | null>>;
	customGoogleLogin: (
		overrideConfig?: OverridableTokenClientConfig | undefined
	) => void;
	googleLoginLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export default AuthContext;
