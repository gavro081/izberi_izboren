import {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useContext,
	useState,
} from "react";
import { Subject } from "../components/types";

type RecommendationsContextType = [
	Subject[],
	Dispatch<SetStateAction<Subject[]>>
];

const RecommendationsContext = createContext<RecommendationsContextType>([
	[],
	() => {},
]);

interface RecommendationsProviderProps {
	children: ReactNode;
}

export const RecommendationsProvider = ({
	children,
}: RecommendationsProviderProps) => {
	const [recommendations, setRecommendations] = useState<Subject[]>([]);

	return (
		<RecommendationsContext.Provider
			value={[recommendations, setRecommendations]}
		>
			{children}
		</RecommendationsContext.Provider>
	);
};

export const useRecommendations = () => useContext(RecommendationsContext);
