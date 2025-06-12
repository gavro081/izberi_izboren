import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthProvider";
import { RecommendationsProvider } from "./context/RecommendationsContext.tsx";
import { SubjectsProvider } from "./context/SubjectsContext.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AuthProvider>
			<SubjectsProvider>
				<RecommendationsProvider>
					<App />
				</RecommendationsProvider>
			</SubjectsProvider>
		</AuthProvider>
	</StrictMode>
);
