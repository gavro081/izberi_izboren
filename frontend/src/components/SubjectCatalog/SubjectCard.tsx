import DislikeButton from "../Recommendations/DislikeButton";
import LikeButton from "../Recommendations/LikeButton";
import { Subject } from "../types";
import FavoriteButton from "./FavoriteButton";

interface SubjectCardProps {
	subject: Subject;
	openSubjectView: (subject: Subject) => void;
	openSubjectDetails: (subject: Subject) => void;
	canReview?: boolean;
	isFirst?: boolean;
	isRecommended?: boolean;
	isLoading?: boolean;
	recommendationDetails?: {
		match_percentage: number;
		primary_reason: string;
		explanations: string[];
		matching_tags: string[];
		detailed_scores: Record<string, number>;
	};
}

const SubjectCard = ({
	subject,
	openSubjectView,
	openSubjectDetails,
	canReview = false,
	isFirst = false,
	isRecommended = false,
	isLoading = false,
	recommendationDetails,
}: SubjectCardProps) => {
	return (
		<div
			key={subject.id}
			className="border border-gray-200 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 h-full"
		>
			<div className="p-4 h-full flex flex-col relative">
				<div className="flex justify-between items-start mb-4">
					<div className="flex-1">
						<h3 className="text-lg font-semibold line-clamp-2 leading-tight">
							{subject.name}
						</h3>
						<p className="text-gray-600 text-sm mt-1">{subject.code}</p>
					</div>
				</div>

				{isRecommended && subject.subject_info.activated === false && (
					<div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10">
						<span className="bg-red-500 text-white font-bold px-3 py-1 rounded-full shadow-lg text-xs whitespace-nowrap">
							Никогаш не бил активиран!
						</span>
					</div>
				)}

				<div className="flex-1 mb-4">
					{recommendationDetails && (
						<div
							className={`rounded-md px-3 py-2 text-sm border ${
								recommendationDetails.match_percentage === 100 && isFirst
									? "bg-green-50 text-green-800 border-green-200"
									: recommendationDetails.match_percentage > 50
									? "bg-blue-50 text-blue-800 border-blue-200"
									: "bg-red-50 text-red-800 border-red-200"
							}`}
						>
							{isFirst ? (
								<div className="flex justify-center mb-2">
									<span className="bg-green-50 text-green-800 border-green-200 font-bold px-3 py-1 rounded-full text-sm">
										Најсоодветен!
									</span>
								</div>
							) : (
								<p className="font-semibold mb-2">
									{recommendationDetails.match_percentage >= 90
										? "Супер за тебе"
										: recommendationDetails.match_percentage >= 75
										? "Многу добар избор"
										: recommendationDetails.match_percentage >= 50
										? "Добар избор"
										: "Не е најдобриот избор"}
								</p>
							)}
							<ul className="space-y-1">
								{recommendationDetails.explanations.map(
									(explanation, index) => (
										<li key={index} className="text-xs leading-relaxed">
											• {explanation}
										</li>
									)
								)}
							</ul>
						</div>
					)}
				</div>

				<div className="flex justify-between items-center gap-3 pt-2 border-t border-gray-100 mt-auto">
					<div className="flex items-center gap-2">
						<button
							onClick={() => openSubjectDetails(subject)}
							className="p-1 hover:bg-gray-100 rounded transition-colors"
							title="Погледни детали"
						>
							<img
								src="src/assets/eye.svg"
								className="w-5 h-5"
								alt="View details"
							/>
						</button>
						<FavoriteButton subjectId={subject.id} isLoading={isLoading} />
						{canReview && (
							<>
								<LikeButton id={subject.id} />
								<DislikeButton id={subject.id} />
							</>
						)}
					</div>
					<div className="flex-shrink-0">
						<button
							onClick={() => openSubjectView(subject)}
							className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-900 text-white text-sm font-medium rounded-md transition-colors"
						>
							<img
								src="src/assets/open.svg"
								className="w-4 h-4 sm:mr-1"
								alt="Open"
							/>
							<span className="hidden sm:inline">Отвори предмет</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SubjectCard;
