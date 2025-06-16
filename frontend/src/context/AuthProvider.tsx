import React, {
	useRef,
	useState,
	useEffect,
	ReactNode,
	useCallback,
} from "react";
import AuthContext, { AuthContextType } from "./AuthContext";
import axiosInstance from "../api/axiosInstance";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { StudentData } from "../components/types";
import { User } from "../context/AuthContext";

interface DecodedToken {
	exp: number;
	iat: number;
	jti: string;
	token_type: string;
	user_id: number;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(
		localStorage.getItem("access")
	);
	const [refreshToken, setRefreshToken] = useState<string | null>(
		localStorage.getItem("refresh")
	);
	const [formData, setFormData] = useState<StudentData | null>(null);
	const [loading, setLoading] = useState(true);

	const proactiveRefreshTimeoutId = useRef<number | null>(null);
	// We cannot use the useAxiosAuth hook here due to the circular dependency.
	const axiosAuth = axiosInstance;

	const fetchUser = useCallback(
		async (token: string) => {
			try {
				const response = await axiosAuth.get<User>("/auth/user/", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				setUser(response.data);
			} catch (error) {
				// If this fails, the token is likely invalid or expired, so log out.
				console.error("Could not fetch user data on load", error);
				logout();
			}
		},
		[axiosAuth]
	);

	// Memoize the refresh function to stabilize dependencies in useEffect
	const refreshAccessToken = useCallback(async (): Promise<string | null> => {
		const currentRefreshToken = localStorage.getItem("refresh");
		if (!currentRefreshToken) {
			logout();
			return null;
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
				setRefreshToken(response.data.refresh);
			}
			scheduleProactiveRefresh(newAccessToken);
			return newAccessToken;
		} catch (error) {
			console.error("Error refreshing access token:", error);
			logout();
			toast.error("Твојата сесија е истечена. Те молам најави се повторно.");
			return null;
		}
	}, []);

	const logout = async () => {
		const refreshToken = localStorage.getItem("refresh");

		if (refreshToken) {
			try {
				const response = await fetch("http://localhost:8000/auth/logout/", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("access")}`,
					},
					body: JSON.stringify({
						refresh: refreshToken,
					}),
				});

				if (response.ok) {
					console.log("Successfully logged out on the server.");
				} else {
					console.error(
						"Server logout failed:",
						response.status,
						response.statusText
					);
				}
			} catch (error) {
				console.error("An error occurred during logout:", error);
			}
		}

		if (proactiveRefreshTimeoutId.current) {
			clearTimeout(proactiveRefreshTimeoutId.current);
		}

		localStorage.removeItem("access");
		localStorage.removeItem("refresh");

		setAccessToken(null);
		setRefreshToken(null);
		setFormData(null);
		setUser(null);
	};

	const scheduleProactiveRefresh = (token: string) => {
		if (proactiveRefreshTimeoutId.current) {
			clearTimeout(proactiveRefreshTimeoutId.current);
		}

		try {
			const decodedToken = jwtDecode<DecodedToken>(token);
			const expirationTime = decodedToken.exp * 1000;
			const currentTime = Date.now();

			// Refresh X milliseconds before the token expires
			const refreshOffset = 30 * 1000;

			let timeoutDuration = expirationTime - currentTime - refreshOffset;

			if (timeoutDuration < 0) {
				// If the token is already about to expire, refresh immediately
				timeoutDuration = 1000;
			}

			proactiveRefreshTimeoutId.current = setTimeout(() => {
				refreshAccessToken();
			}, timeoutDuration);
		} catch (error) {
			console.error("Failed to decode token for proactive refresh:", error);
		}
	};

	useEffect(() => {
		const requestIntercept = axiosAuth.interceptors.request.use(
			(config) => {
				if (!config.headers["Authorization"]) {
					config.headers["Authorization"] = `Bearer ${accessToken}`;
				}
				return config;
			},
			(error) => Promise.reject(error)
		);

		const responseIntercept = axiosAuth.interceptors.response.use(
			(response) => response,
			async (error) => {
				const prevRequest = error?.config;
				if (error?.response?.status === 401 && !prevRequest?.sent) {
					prevRequest.sent = true;
					const newAccessToken = await refreshAccessToken();
					if (newAccessToken) {
						prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
						return axiosAuth(prevRequest);
					}
				}
				return Promise.reject(error);
			}
		);

		return () => {
			axiosAuth.interceptors.request.eject(requestIntercept);
			axiosAuth.interceptors.response.eject(responseIntercept);
		};
	}, [accessToken, refreshAccessToken, axiosAuth]);

	const fetchFormData = useCallback(
		async (tokenOverride?: string | null) => {
			// Determine which token to use: the override from login, or the one from state (for refresh)
			const tokenToUse = tokenOverride || accessToken;

			if (!tokenToUse) {
				console.log("Fetch aborted, no token available.");
				return;
			}

			try {
				const response = await axiosAuth.get<StudentData>("/auth/form/", {
					headers: {
						Authorization: `Bearer ${tokenToUse}`,
					},
				});
				setFormData(response.data);
			} catch (error) {
				console.error("Could not fetch user form data", error);
				toast.error("Не може да се вчитаат податоците.");
			}
		},
		[axiosAuth, accessToken]
	);

	const login = async (
		newAccessToken: string,
		newRefreshToken: string,
		userData: User
	) => {
		localStorage.setItem("access", newAccessToken);
		localStorage.setItem("refresh", newRefreshToken);
		setUser(userData);
		setAccessToken(newAccessToken);
		setRefreshToken(newRefreshToken);
		scheduleProactiveRefresh(newAccessToken);
		await fetchFormData(newAccessToken);
	};

	useEffect(() => {
		const initializeAuth = async () => {
			const token = localStorage.getItem("access");
			if (token) {
				scheduleProactiveRefresh(token);
				// Fetch user data and form data in parallel for speed
				await Promise.all([fetchUser(token), fetchFormData(token)]);
			}
			setLoading(false);
		};

		initializeAuth();
	}, [fetchUser, fetchFormData]);

	useEffect(() => {
		return () => {
			if (proactiveRefreshTimeoutId.current) {
				clearTimeout(proactiveRefreshTimeoutId.current);
			}
		};
	}, []);

	const contextValue: AuthContextType = {
		accessToken,
		refreshToken,
		formData,
		setFormData,
		user,
		login,
		logout,
		isAuthenticated: !!accessToken,
		refreshAccessToken,
		loading,
	};

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	);
};
