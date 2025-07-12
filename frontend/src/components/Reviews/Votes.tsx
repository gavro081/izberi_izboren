import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../hooks/useAuth";
import { Review } from "../types";

interface VotesProps {
	review: Review;
}

const Votes = ({ review }: VotesProps) => {
	const [localCount, setLocalCount] = useState<number>(review.votes_count ?? 0);
	const { isAuthenticated } = useAuth();
	const handleClick = async (vote_type: "up" | "down") => {
		const review_id = review.id;
		console.log(review_id);
		console.log(vote_type);
		try {
			const response = await axiosInstance.post(
				"subjects/subject-review/toggle-vote/",
				{
					review_id: review_id,
					vote_type: vote_type,
				}
			);
			setLocalCount((prevCount) =>
				vote_type == "up" ? prevCount + 1 : prevCount - 1
			);
			console.log(response.data);
		} catch (err) {
			console.error("Error occured: ", err);
		}
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
				{localCount}
			</span>
			<button
				className={`flex items-center justify-center w-6 h-6 text-gray-400 rounded transition-color ${
					!isAuthenticated
						? "cursor-not-allowed"
						: "cursor-pointer hover:text-red-600 hover:bg-red-50"
				}`}
				onClick={() => handleClick("down")}
				disabled={!isAuthenticated}
			>
				<ArrowDown className="w-4 h-4" />
			</button>
		</div>
	);
};

export default Votes;
