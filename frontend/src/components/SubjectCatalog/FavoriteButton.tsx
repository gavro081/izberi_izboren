import { usePreferences } from "../../context/PreferencesContext";
import { useAuth } from "../../hooks/useAuth";

const HeartIcon = ({ filled }: { filled: boolean }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-7 w-7"
		fill={filled ? "currentColor" : "none"}
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
		/>
	</svg>
);

interface FavoriteButtonProps {
	subjectId: number;
	isLoading?: boolean;
}

const FavoriteButton = ({ subjectId, isLoading }: FavoriteButtonProps) => {
	const { favoriteIds, toggleFavorite } = usePreferences();
	const { isAuthenticated } = useAuth();
	const isFavorite = favoriteIds?.has(subjectId) || false;
	const isFilled = isAuthenticated && isFavorite;
	return (
		<button
			onClick={() => toggleFavorite(subjectId)}
			disabled={isLoading || !isAuthenticated}
			className={`relative flex items-center justify-center transition-all duration-200 p-2 rounded-full 
				${!isAuthenticated ? "cursor-not-allowed" : ""}
				${isFavorite ? "text-red-500" : "text-gray-400"}
				${isLoading ? "cursor-not-allowed animate-pulse" : ""}`}
			aria-label={isFavorite ? "Unfavorite" : "Favorite"}
		>
			<HeartIcon filled={isFilled} />
		</button>
	);
};

export default FavoriteButton;
