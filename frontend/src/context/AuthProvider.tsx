import React, { useState, ReactNode } from "react";
import AuthContext, { AuthContextType } from "./AuthContext";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("access")
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refresh")
  );
  const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem("refresh");
    if (!refreshToken) {
      logout();
      toast.error("Session expired. Please log in again.");
      return null;
    }
    try {
      const response = await axiosInstance.post<{ access: string; refresh?: string }>(
        "/auth/refresh/",
        { refresh: refreshToken }
      );

      const newAccessToken = response.data.access;
      localStorage.setItem("access", newAccessToken);
      setAccessToken(newAccessToken);

      if (response.data.refresh) {
        const newRefreshToken = response.data.refresh;
        localStorage.setItem("refresh", newRefreshToken);
        setRefreshToken(newRefreshToken);
      }

      return newAccessToken;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      logout();
      return null;
    }
  };

  const login = (newAccessToken: string, newRefreshToken: string) => {
    localStorage.setItem("access", newAccessToken);
    localStorage.setItem("refresh", newRefreshToken);
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setAccessToken(null);
    setRefreshToken(null);
  };

  const isAuthenticated = !!accessToken;

  const contextValue: AuthContextType = {
    accessToken,
    refreshToken,
    login,
    logout,
    isAuthenticated,
    refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};