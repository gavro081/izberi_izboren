import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";

const ProtectedLayout: React.FC = () => {
	const { loading, sessionInitialized, initializeUser } = useAuth();
	const [isInitializing, setIsInitializing] = useState(true);

	useEffect(() => {
		// If the session isn't initialized and the initial token check is done
		if (!sessionInitialized && !loading) {
			initializeUser().finally(() => {
				setIsInitializing(false);
			});
		} else {
			setIsInitializing(false);
		}
	}, [loading, sessionInitialized, initializeUser]);

	if (isInitializing) {
		return <LoadingSpinner />;
	}

	// Once done, render the child route (e.g. Recommendations)
	return <Outlet />;
};

export default ProtectedLayout;
