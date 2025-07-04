import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface PrivateRouteProps {
	children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();
	if (!isAuthenticated && !loading) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
};

export default PrivateRoute;
