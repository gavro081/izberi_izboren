import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import useAxiosAuth from "../hooks/useAxiosAuth";
interface PreferencesContextType {
	favoriteIds: Set<number>;
	likedIds: Set<number>;
	dislikedIds: Set<number>;
	toggleFavorite: (subjectId: number) => Promise<void>;
	toggleLike: (subjectId: number) => Promise<void>;
	toggleDislike: (subjectId: number) => Promise<void>;
	isLoading: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
	undefined
);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
	const { accessToken } = useAuth();
	const axiosAuth = useAxiosAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
	const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
	const [dislikedIds, setDislikedIds] = useState<Set<number>>(new Set());

	useEffect(() => {
		if (accessToken) {
			setIsLoading(true);
			axiosAuth
				.get<{
					favorite_ids: number[];
					liked_ids: number[];
					disliked_ids: number[];
				}>("/student/preferences/")
				.then((response) => {
					setFavoriteIds(new Set(response.data.favorite_ids || []));
					setLikedIds(new Set(response.data.liked_ids || []));
					setDislikedIds(new Set(response.data.disliked_ids || []));
				})
				.catch((error) => console.error("Failed to fetch preferences:", error))
				.finally(() => setIsLoading(false));
		} else {
			// If user logs out, clear preferences
			setFavoriteIds(new Set());
			setLikedIds(new Set());
			setDislikedIds(new Set());
			setIsLoading(false);
		}
	}, [accessToken, axiosAuth]);

	const toggleFavorite = useCallback(
		async (subjectId: number) => {
			// Optimistic UI update
			const originalFavorites = new Set(favoriteIds);
			setFavoriteIds((prevIds) => {
				const newIds = new Set(prevIds);
				if (newIds.has(subjectId)) {
					newIds.delete(subjectId);
				} else {
					newIds.add(subjectId);
				}
				return newIds;
			});

			try {
				await axiosAuth.post("/student/toggle-subject-pref/", {
					subject_id: subjectId,
					action_type: "favorite",
				});
			} catch (error) {
				console.error("Failed to toggle favorite, reverting.", error);
				setFavoriteIds(originalFavorites); // Revert on error
				toast.error("Мора да си најавен за да додадеш предмет во омилени.");
			}
		},
		[axiosAuth, favoriteIds]
	);

	const toggleLike = useCallback(
		async (subjectId: number) => {
			const wasDisliked = dislikedIds.has(subjectId);
			if (wasDisliked) {
				const newDisliked = new Set(dislikedIds);
				newDisliked.delete(subjectId);
				setDislikedIds(newDisliked);
			}
			const originalLiked = new Set(likedIds);
			setLikedIds((prevIds) => {
				const newIds = new Set(prevIds);
				if (newIds.has(subjectId)) {
					newIds.delete(subjectId);
				} else {
					newIds.add(subjectId);
				}
				return newIds;
			});

			try {
				await axiosAuth.post("/student/toggle-subject-pref/", {
					subject_id: subjectId,
					action_type: "liked",
				});
				if (wasDisliked) {
					await axiosAuth.post("/student/toggle-subject-pref/", {
						subject_id: subjectId,
						action_type: "disliked",
					});
				}
			} catch (error) {
				console.error("Failed to toggle liked, reverting.", error);
				setLikedIds(originalLiked);
				toast.error("Мора да си најавен за да додадеш оценка на препорака.");
			}
		},
		[axiosAuth, likedIds]
	);

	const toggleDislike = useCallback(
		async (subjectId: number) => {
			const wasLiked = likedIds.has(subjectId);
			if (wasLiked) {
				const newLiked = new Set(likedIds);
				newLiked.delete(subjectId);
				setLikedIds(newLiked);
			}
			const originalDisliked = new Set(likedIds);
			setDislikedIds((prevIds) => {
				const newIds = new Set(prevIds);
				if (newIds.has(subjectId)) {
					newIds.delete(subjectId);
				} else {
					newIds.add(subjectId);
				}
				return newIds;
			});

			try {
				await axiosAuth.post("/student/toggle-subject-pref/", {
					subject_id: subjectId,
					action_type: "disliked",
				});
				if (wasLiked) {
					await axiosAuth.post("/student/toggle-subject-pref/", {
						subject_id: subjectId,
						action_type: "liked",
					});
				}
			} catch (error) {
				console.error("Failed to toggle liked, reverting.", error);
				setDislikedIds(originalDisliked);
				toast.error("Мора да си најавен за да додадеш лајк на предмет.");
			}
		},
		[axiosAuth, likedIds]
	);

	const value = {
		favoriteIds,
		likedIds,
		dislikedIds,
		toggleFavorite,
		toggleLike,
		toggleDislike,
		isLoading,
	};

	return (
		<PreferencesContext.Provider value={value}>
			{children}
		</PreferencesContext.Provider>
	);
};

export const usePreferences = () => {
	const context = useContext(PreferencesContext);
	if (context === undefined) {
		throw new Error("usePreferences must be used within a PreferencesProvider");
	}
	return context;
};
