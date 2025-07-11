import { useGoogleLogin } from "@react-oauth/google";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";
import React, {
	ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { fetchUser } from "../api/user";
import { StudentData } from "../components/types";
import AuthContext, { AuthContextType, User } from "../context/AuthContext";
const useOAuth = import.meta.env.VITE_USE_OAUTH === "true";

interface DecodedToken {
	exp: number;
	iat: number;
	jti: string;
	token_type: string;
	user_id: number;
}

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
	_retry?: boolean;
	_skipAuthRefresh?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value: string | null) => void;
	reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [formData, setFormData] = useState<StudentData | null>(null);
	const [loading, setLoading] = useState(true);
	const [sessionInitialized, setSessionInitialized] = useState(false);
	const [googleLoginLoading, setGoogleLoginLoading] = useState(false);

	const proactiveRefreshTimeoutId = useRef<number | null>(null);

	const logout = useCallback(() => {
		if (proactiveRefreshTimeoutId.current) {
			clearTimeout(proactiveRefreshTimeoutId.current);
		}
		const currentRefreshToken = localStorage.getItem("refresh");
		if (currentRefreshToken) {
			axiosInstance
				.post("/auth/logout/", { refresh: currentRefreshToken })
				.catch((err) =>
					console.error(
						"Server logout failed, proceeding with client-side cleanup",
						err
					)
				);
		}
		localStorage.removeItem("access");
		localStorage.removeItem("refresh");
		setAccessToken(null);
		setFormData(null);
		setUser(null);
		setSessionInitialized(false); // Reset session on logout
	}, []);

	const scheduleProactiveRefresh = useCallback(
		(token: string) => {
			if (proactiveRefreshTimeoutId.current) {
				clearTimeout(proactiveRefreshTimeoutId.current);
			}
			try {
				const decodedToken = jwtDecode<DecodedToken>(token);
				const expirationTime = decodedToken.exp * 1000;
				const currentTime = Date.now();
				const refreshOffset = 15 * 1000;
				const timeoutDuration = expirationTime - currentTime - refreshOffset;
				if (timeoutDuration > 0) {
					proactiveRefreshTimeoutId.current = window.setTimeout(async () => {
						if (isRefreshing) return;
						const currentRefreshToken = localStorage.getItem("refresh");
						if (currentRefreshToken) {
							isRefreshing = true;
							try {
								const res = await axiosInstance.post<{
									access: string;
									refresh?: string;
								}>("/auth/refresh/", { refresh: currentRefreshToken }, {
									_skipAuthRefresh: true,
								} as CustomAxiosRequestConfig);
								localStorage.setItem("access", res.data.access);
								setAccessToken(res.data.access);
								if (res.data.refresh) {
									localStorage.setItem("refresh", res.data.refresh);
								}
								scheduleProactiveRefresh(res.data.access);
							} catch (err) {
								console.error("Proactive token refresh failed:", err);
								logout();
							} finally {
								isRefreshing = false;
							}
						}
					}, timeoutDuration);
				}
			} catch (error) {
				console.error("Failed to decode token for proactive refresh:", error);
			}
		},
		[logout]
	);

	useEffect(() => {
		const requestIntercept = axiosInstance.interceptors.request.use(
			(config) => {
				const token = localStorage.getItem("access");
				if (token && !config.headers["Authorization"]) {
					config.headers["Authorization"] = `Bearer ${token}`;
				}
				return config;
			},
			(error: AxiosError) => Promise.reject(error)
		);
		const responseIntercept = axiosInstance.interceptors.response.use(
			(response) => response,
			async (error) => {
				const originalRequest = error.config as CustomAxiosRequestConfig;
				if (
					error.response?.status === 401 &&
					!originalRequest._retry &&
					!originalRequest._skipAuthRefresh
				) {
					originalRequest._retry = true;
					if (isRefreshing) {
						return new Promise((resolve, reject) => {
							failedQueue.push({ resolve, reject });
						}).then((token) => {
							if (originalRequest.headers) {
								originalRequest.headers["Authorization"] = "Bearer " + token;
							}
							return axiosInstance(originalRequest);
						});
					}
					isRefreshing = true;
					const currentRefreshToken = localStorage.getItem("refresh");
					if (!currentRefreshToken) {
						isRefreshing = false;
						logout();
						return Promise.reject(error);
					}
					try {
						const response = await axiosInstance.post<{
							access: string;
							refresh?: string;
						}>("/auth/refresh/", { refresh: currentRefreshToken }, {
							_skipAuthRefresh: true,
						} as CustomAxiosRequestConfig);
						const newAccessToken = response.data.access;
						localStorage.setItem("access", newAccessToken);
						setAccessToken(newAccessToken);
						if (response.data.refresh) {
							localStorage.setItem("refresh", response.data.refresh);
						}
						scheduleProactiveRefresh(newAccessToken);
						if (originalRequest.headers) {
							originalRequest.headers[
								"Authorization"
							] = `Bearer ${newAccessToken}`;
						}
						processQueue(null, newAccessToken);
						return axiosInstance(originalRequest);
					} catch (refreshError) {
						processQueue(refreshError, null);
						logout();
						toast.error("Твојата сесија истече. Најави се повторно.");
						return Promise.reject(refreshError);
					} finally {
						isRefreshing = false;
					}
				}
				return Promise.reject(error);
			}
		);
		return () => {
			axiosInstance.interceptors.request.eject(requestIntercept);
			axiosInstance.interceptors.response.eject(responseIntercept);
		};
	}, [logout, scheduleProactiveRefresh]);

	const login = useCallback(
		async (newAccessToken: string, newRefreshToken: string, userData: User) => {
			localStorage.setItem("access", newAccessToken);
			localStorage.setItem("refresh", newRefreshToken);
			setAccessToken(newAccessToken);
			setUser(userData);
			scheduleProactiveRefresh(newAccessToken);
		},
		[scheduleProactiveRefresh]
	);

	const customGoogleLogin = useOAuth
		? useGoogleLogin({
				onSuccess: async (tokenResponse) => {
					setGoogleLoginLoading(true);
					const accessToken = tokenResponse.access_token;
					try {
						const response = await axios.post<{
							access: string;
							refresh: string;
							full_name: string;
							user_type: string;
						}>("http://localhost:8000/auth/google/login/", {
							access_token: accessToken,
						});
						const { access, refresh, full_name, user_type } = response.data;
						await login(access, refresh, { full_name, user_type });
						toast.success("Успешно сте најавени!");
						window.dispatchEvent(new CustomEvent("googleLoginSuccess"));
					} catch (err: any) {
						console.error("Login failed:", err.response?.data || err.message);
						toast.error("Грешка при најавување со Google");
					} finally {
						setGoogleLoginLoading(false);
					}
				},
				onError: () => {
					console.error("Login Failed");
					setGoogleLoginLoading(false);
					toast.error("Грешка при најавување со Google");
				},
				flow: "implicit",
		  })
		: undefined;

	useEffect(() => {
		(async () => {
			const token = localStorage.getItem("access");
			if (token) {
				setAccessToken(token);
				await fetchUser(token, setUser);
			}
			setLoading(false);
		})();
	}, []);

	const contextValue: AuthContextType = {
		user,
		accessToken,
		formData,
		setFormData,
		login,
		logout,
		isAuthenticated: !!accessToken,
		loading,
		sessionInitialized,
		setUser,
		customGoogleLogin,
		googleLoginLoading,
		useOAuth,
	};

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	);
};
