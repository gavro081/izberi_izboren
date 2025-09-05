import { ThumbsUp } from "lucide-react";
import { usePreferences } from "../../context/PreferencesContext";
import { SubjectID } from "../types";

interface LikeButtonProps {
	id: SubjectID;
}

const LikeButton = ({ id }: LikeButtonProps) => {
	const { likedIds, toggleLike } = usePreferences();
	return (
		<button
			onClick={() => toggleLike(id)}
			className={`p-1 hover:bg-green-100 rounded transition-colors group ${
				likedIds && likedIds.has(id)
					? "text-green-600 bg-green-100"
					: "text-gray-400"
			}`}
		>
			<ThumbsUp className="group-hover:text-green-600 transition-colors" />
		</button>
	);
};

export default LikeButton;
