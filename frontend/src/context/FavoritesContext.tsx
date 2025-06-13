import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth'; 
import useAxiosAuth from '../hooks/useAxiosAuth';
import { toast } from 'react-toastify';
interface FavoritesContextType {
    favoriteIds: Set<number>; 
    toggleFavorite: (subjectId: number) => Promise<void>;
    isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const { accessToken } = useAuth(); 
    const axiosAuth = useAxiosAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

     useEffect(() => {
        if (accessToken) {
            setIsLoading(true);
            axiosAuth.get<{ favorite_ids: number[] }>('/student/favorites/')
                .then(response => {
                    setFavoriteIds(new Set(response.data.favorite_ids));
                })
                .catch(error => console.error("Failed to fetch favorites:", error))
                .finally(() => setIsLoading(false));
        } else {
            // If user logs out, clear the favorites
            setFavoriteIds(new Set());
            setIsLoading(false);
        }
    }, [accessToken, axiosAuth]);

     const toggleFavorite = useCallback(async (subjectId: number) => {
        // Optimistic UI update
        const originalFavorites = new Set(favoriteIds);
        setFavoriteIds(prevIds => {
            const newIds = new Set(prevIds);
            if (newIds.has(subjectId)) {
                newIds.delete(subjectId);
            } else {
                newIds.add(subjectId);
            }
            return newIds;
        });

        try {
            await axiosAuth.post('/student/toggle-favorite/', { subject_id: subjectId });
        } catch (error) {
            console.error('Failed to toggle favorite, reverting.', error);
            setFavoriteIds(originalFavorites); // Revert on error
            toast.error("Мора да си најавен за да додадеш предмет во омилени.");
        }
    }, [axiosAuth, favoriteIds]);

    const value = { favoriteIds, toggleFavorite, isLoading };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};