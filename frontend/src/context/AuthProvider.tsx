import React, { useState, useEffect, ReactNode } from "react";
import AuthContext, { AuthContextType } from "./AuthContext";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken !== token) {
      setToken(storedToken);
    }
  }, [token]);
  const login = (newToken: string) => {
    console.log("Logging in with token:", newToken);
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };
  const isAuthenticated = !!token;

  const contextValue: AuthContextType = {
    token,
    login,
    logout,
    isAuthenticated,
  };
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
