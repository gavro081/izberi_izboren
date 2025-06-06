import React, { useState, ReactNode } from "react";
import AuthContext, { AuthContextType } from "./AuthContext";
import axiosInstance from "../api/axiosInstance";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("access_token")
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refresh_token")
  );
  const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      logout();
      return null;
    }
    try {
      const response = await axiosInstance.post<{ access: string; refresh?: string }>(
        "/auth/refresh/",
        { refresh: refreshToken }
      );

      const newAccessToken = response.data.access;
      localStorage.setItem("access_token", newAccessToken);
      setAccessToken(newAccessToken);

      if (response.data.refresh) {
        const newRefreshToken = response.data.refresh;
        localStorage.setItem("refresh_token", newRefreshToken);
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
    localStorage.setItem("access_token", newAccessToken);
    localStorage.setItem("refresh_token", newRefreshToken);
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
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