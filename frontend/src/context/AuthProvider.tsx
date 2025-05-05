import React, { useState, useEffect, ReactNode } from "react";
import AuthContext, { AuthContextType } from "./AuthContext";
import axios from "axios";

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem("refresh_token");
  console.log(refreshToken);
  if (!refreshToken) {
    return null;
  }
  try {
    const response = await axios.post<{ access: string; refresh?: string }>(
      "http://localhost:8000/auth/refresh/",
      { refresh: refreshToken }
    );
    console.log(response);

    const newAccessToken = response.data.access;

    localStorage.setItem("access_token", newAccessToken);

    if (response.data.refresh) {
      const newRefreshToken = response.data.refresh;
      localStorage.setItem("refresh_token", newRefreshToken);
    }

    return newAccessToken;
  } catch (error) {
    console.error("Error refrershing access token:", error);
    return null;
  }
};
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("access_token")
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refresh_token")
  );
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("access_token");
    const storedRefreshToken = localStorage.getItem("refresh_token");

    if (storedAccessToken !== accessToken) {
      setAccessToken(storedAccessToken);
    }

    if (storedRefreshToken !== refreshToken) {
      setAccessToken(storedRefreshToken);
    }
  }, [accessToken, refreshToken]);
  const login = (newAccessToken: string, newRefreshToken: string) => {
    console.log("Logging in with access token:", newAccessToken);
    console.log("Refresh token:", newRefreshToken);
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
