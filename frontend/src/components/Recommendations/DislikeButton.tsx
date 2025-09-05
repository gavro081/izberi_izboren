import { ThumbsDown } from "lucide-react";
import { usePreferences } from "../../context/PreferencesContext";
import { SubjectID } from "../types";

interface DislikeButtonProps {
	id: SubjectID;
}

const DislikeButton = ({ id }: DislikeButtonProps) => {
	const { dislikedIds, toggleDislike } = usePreferences();
	return (
		<button
			onClick={() => toggleDislike(id)}
			className={`p-1 hover:bg-green-100 rounded transition-colors group ${
				dislikedIds && dislikedIds.has(id)
					? "text-red-600 bg-red-100"
					: "text-gray-400"
			}`}
		>
			<ThumbsDown className="group-hover:text-red-600 transition-colors" />
		</button>
	);
};

export default DislikeButton;
