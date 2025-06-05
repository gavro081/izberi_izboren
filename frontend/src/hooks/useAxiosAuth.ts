import { useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import axiosInstance from "../api/axiosInstance";

const useAxiosAuth = () => {
  const { accessToken, refreshAccessToken, logout } = useAuth();
  const accessTokenRef = useRef(accessToken);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        if (accessTokenRef.current) {
          config.headers.Authorization = `Bearer ${accessTokenRef.current}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await refreshAccessToken();

            if (newAccessToken) {
              // The request interceptor will handle adding the new header
              return axiosInstance(originalRequest);
            } else {
              logout();
              return Promise.reject(new Error("Token refresh failed."));
            }
          } catch (_error) {
            logout();
            return Promise.reject(_error);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshAccessToken, logout]);

  return axiosInstance;
};

export default useAxiosAuth;
