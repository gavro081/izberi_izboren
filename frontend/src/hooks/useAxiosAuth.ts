import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import axiosInstance from "../api/axiosInstance";

const useAxiosAuth = () => {
  const { accessToken, refreshAccessToken, logout } = useAuth();

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newToken = await refreshAccessToken();
          localStorage.setItem("access_token", newToken || "");
          if (newToken) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          } else {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, refreshAccessToken, logout]);
};
export default useAxiosAuth;
