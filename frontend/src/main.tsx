import { GoogleOAuthProvider } from "@react-oauth/google";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthProvider";
import { PreferencesProvider } from "./context/PreferencesContext.tsx";
import { RecommendationsProvider } from "./context/RecommendationsContext.tsx";
import { SubjectsProvider } from "./context/SubjectsContext.tsx";
import "./index.css";

const useOAuth = import.meta.env.VITE_USE_OAUTH === "true";

const OAuthWrapper: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	if (useOAuth) {
		return (
			<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
				{children}
			</GoogleOAuthProvider>
		);
	}
	return <>{children}</>;
};

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<OAuthWrapper>
			<AuthProvider>
				<SubjectsProvider>
					<RecommendationsProvider>
						<PreferencesProvider>
							<App />
						</PreferencesProvider>
					</RecommendationsProvider>
				</SubjectsProvider>
			</AuthProvider>
		</OAuthWrapper>
	</StrictMode>
);
