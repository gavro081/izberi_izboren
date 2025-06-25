import { Dispatch, SetStateAction } from "react";
import axiosInstance from "../api/axiosInstance";

interface FetchPreferencesProps {
	setIsLoaded?: Dispatch<SetStateAction<boolean>>;
	setIsLoading?: Dispatch<SetStateAction<boolean>>;
	setDislikedIds: Dispatch<SetStateAction<Set<number> | undefined>>;
	setFavoriteIds: Dispatch<SetStateAction<Set<number> | undefined>>;
	setLikedIds: Dispatch<SetStateAction<Set<number> | undefined>>;
}

export const fetchPreferences = async ({
	setIsLoading,
	setDislikedIds,
	setFavoriteIds,
	setLikedIds,
	setIsLoaded,
}: FetchPreferencesProps) => {
	const accessToken = localStorage.getItem("access");
	if (accessToken) {
		axiosInstance
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
			.finally(() => {
				setIsLoaded && setIsLoaded(true);
				setIsLoading && setIsLoading(false);
			});
	} else {
		setFavoriteIds(new Set());
		setLikedIds(new Set());
		setDislikedIds(new Set());
		setIsLoaded && setIsLoaded(true);
		setIsLoading && setIsLoading(false);
	}
};
