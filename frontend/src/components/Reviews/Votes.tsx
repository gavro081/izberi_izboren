import { ArrowDown, ArrowUp } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Reviews } from "../types";

interface VotesProps {
	reviews: Reviews;
	review_id?: number;
}

const Votes = ({ reviews }: VotesProps) => {
	const { isAuthenticated } = useAuth();
	const handleClick = (action: "up" | "down") => {
		console.log(action);
	};

	return (
		<div className="flex items-center space-x-1">
			<button
				className={`flex items-center justify-center w-6 h-6 text-gray-400 rounded transition-colors ${
					!isAuthenticated
						? "cursor-not-allowed"
						: "cursor-pointer hover:text-green-600 hover:bg-green-50 "
				}`}
				onClick={() => handleClick("up")}
				disabled={!isAuthenticated}
			>
				<ArrowUp className="w-4 h-4" />
			</button>
			<span className="text-sm font-medium text-gray-700 min-w-[20px] text-center">
				{reviews.evaluation?.review.votes_count}
			</span>
			<button
				className={`flex items-center justify-center w-6 h-6 text-gray-400 rounded transition-color ${
					!isAuthenticated
						? "cursor-not-allowed"
						: "cursor-pointer hover:text-red-600 hover:bg-red-50"
				}`}
				disabled={!isAuthenticated}
			>
				<ArrowDown className="w-4 h-4" />
			</button>
		</div>
	);
};

export default Votes;
