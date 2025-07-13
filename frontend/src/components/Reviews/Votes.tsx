import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../hooks/useAuth";
import { Review } from "../types";

interface VotesProps {
	review: Review;
}

const Votes = ({ review }: VotesProps) => {
	const [localCount, setLocalCount] = useState<number>(review.votes_score ?? 0);
	const { isAuthenticated } = useAuth();
	const [userVote, setUserVote] = useState<"up" | "down" | "none">(
		review.user_has_voted ?? "none"
	);

	const handleClick = async (vote_type: "up" | "down") => {
		const review_id = review.id;
		try {
			const response = await axiosInstance.post<{
				message: string;
				vote_score: number;
			}>("subjects/subject-review/toggle-vote/", {
				review_id: review_id,
				vote_type: vote_type,
			});
			setUserVote(userVote === vote_type ? "none" : vote_type);

			// in the case that someone has voted on a review since we opened the page and we vote on the same review
			// an upvote or downvote might change the counter by more than one which might look confusing
			setLocalCount(response.data.vote_score);
		} catch (err) {
			console.error("Error occured: ", err);
		}
	};

	return (
		<div className="flex items-center space-x-1">
			<button
				className={`flex items-center justify-center w-6 h-6 rounded transition-colors${
					!isAuthenticated
						? "cursor-not-allowed"
						: "cursor-pointer hover:text-green-600 hover:bg-green-50 "
				}
					${userVote == "up" ? "text-green-600" : "text-gray-400"}`}
				onClick={() => handleClick("up")}
				disabled={!isAuthenticated}
			>
				<ArrowUp className="w-4 h-4" />
			</button>
			<span className="text-sm font-medium text-gray-700 min-w-[20px] text-center">
				{localCount}
			</span>
			<button
				className={`flex items-center justify-center w-6 h-6 rounded transition-colors${
					!isAuthenticated
						? "cursor-not-allowed"
						: "cursor-pointer hover:text-red-600 hover:bg-green-50 "
				}
					${userVote == "down" ? "text-red-600" : "text-gray-400"}`}
				onClick={() => handleClick("down")}
				disabled={!isAuthenticated}
			>
				<ArrowDown className="w-4 h-4" />
			</button>
		</div>
	);
};

export default Votes;
