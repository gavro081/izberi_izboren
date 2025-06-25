import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
interface PreferencesContextType {
	favoriteIds: Set<number> | undefined;
	setFavoriteIds: React.Dispatch<React.SetStateAction<Set<number> | undefined>>;
	likedIds: Set<number> | undefined;
	setLikedIds: React.Dispatch<React.SetStateAction<Set<number> | undefined>>;
	dislikedIds: Set<number> | undefined;
	setDislikedIds: React.Dispatch<React.SetStateAction<Set<number> | undefined>>;
	toggleFavorite: (subjectId: number) => Promise<void>;
	toggleLike: (subjectId: number) => Promise<void>;
	toggleDislike: (subjectId: number) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
	undefined
);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
	const [favoriteIds, setFavoriteIds] = useState<Set<number> | undefined>(
		undefined
	);
	const [likedIds, setLikedIds] = useState<Set<number> | undefined>(undefined);
	const [dislikedIds, setDislikedIds] = useState<Set<number> | undefined>(
		undefined
	);

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
				await axiosInstance.post("/student/toggle-subject-pref/", {
					subject_id: subjectId,
					action_type: "favorite",
				});
			} catch (error) {
				console.error("Failed to toggle favorite, reverting.", error);
				setFavoriteIds(originalFavorites); // Revert on error
				toast.error("Мора да си најавен за да додадеш предмет во омилени.");
			}
		},
		[favoriteIds]
	);

	const toggleLike = useCallback(
		async (subjectId: number) => {
			const wasDisliked = dislikedIds?.has(subjectId);
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
				await axiosInstance.post("/student/toggle-subject-pref/", {
					subject_id: subjectId,
					action_type: "liked",
				});
				if (wasDisliked) {
					await axiosInstance.post("/student/toggle-subject-pref/", {
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
		[likedIds]
	);

	const toggleDislike = useCallback(
		async (subjectId: number) => {
			const wasLiked = likedIds?.has(subjectId);
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
				await axiosInstance.post("/student/toggle-subject-pref/", {
					subject_id: subjectId,
					action_type: "disliked",
				});
				if (wasLiked) {
					await axiosInstance.post("/student/toggle-subject-pref/", {
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
		[likedIds]
	);

	const value = {
		favoriteIds,
		setFavoriteIds,
		likedIds,
		setLikedIds,
		dislikedIds,
		setDislikedIds,
		toggleFavorite,
		toggleLike,
		toggleDislike,
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
