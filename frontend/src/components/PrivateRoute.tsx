import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { UserType } from "./types";

interface PrivateRouteProps {
	allowedUserTypes?: UserType[];
	children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
	allowedUserTypes,
	children,
}) => {
	const { isAuthenticated, loading, user } = useAuth();
	if (loading) {
		// TODO: add loading screen or skeleton, or dont
		return null;
	}
	if (!isAuthenticated && !loading) {
		return <Navigate to="/login" replace />;
	}

	if (allowedUserTypes && user && !allowedUserTypes.includes(user.user_type))
		return <Navigate to="/" replace />;

	return <>{children}</>;
};

export default PrivateRoute;
