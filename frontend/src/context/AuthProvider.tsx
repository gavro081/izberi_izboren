import { AxiosError, AxiosRequestConfig } from "axios";
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

interface DecodedToken {
	exp: number;
	iat: number;
	jti: string;
	token_type: string;
	user_id: number;
}

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
	_retry?: boolean;
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
								}>("/auth/refresh/", { refresh: currentRefreshToken });
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
				if (error.response?.status === 401 && !originalRequest._retry) {
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
						}>("/auth/refresh/", { refresh: currentRefreshToken });
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
						toast.error("Your session has expired. Please log in again.");
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
	};

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	);
};
