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
}

const SubjectCard = ({
	subject,
	openSubjectView,
	openSubjectDetails,
	canReview = false,
	isFirst = false,
	isRecommended = false,
	isLoading = false,
}: SubjectCardProps) => {
	return (
		<div
			key={subject.id}
			className="border border-gray-200 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
		>
			<div className="p-4 min-h-full flex flex-col gap-1">
				<div
					className={`flex justify-between items-start 
					${isRecommended ? "mb-16" : "mb-8"}`}
				>
					<div>
						<h3 className="text-lg font-semibold">{subject.name}</h3>
						<p className="text-gray-600">{subject.code}</p>
					</div>
				</div>
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					{isRecommended && subject.subject_info.activated === false ? (
						<span className="bg-red-500 text-white font-bold px-3 py-1 rounded-full shadow-lg text-xs transition-opacity duration-300 z-10">
							Никогаш не бил активиран!
						</span>
					) : isFirst ? (
						<span className="bg-blue-600 text-white font-bold px-3 py-1 rounded-full shadow-lg text-xs transition-opacity duration-300 z-10">
							Најсоодветен!
						</span>
					) : null}
				</div>
				<div className="flex justify-between mt-auto gap-3">
					<div className="flex items-center gap-2">
						<button onClick={() => openSubjectDetails(subject)}>
							<img src="src/assets/eye.svg" className="w-5 h-5" />
						</button>
						<FavoriteButton subjectId={subject.id} isLoading={isLoading} />
						{canReview && (
							<>
								<LikeButton id={subject.id} />
								<DislikeButton id={subject.id} />
							</>
						)}
					</div>
					<div className="flex-1 flex justify-end">
						<button
							onClick={() => openSubjectView(subject)}
							className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-900 text-white text-sm font-medium rounded-md transition-colors"
						>
							<img src="src/assets/open.svg" className="w-4 h-4 mr-1" />
							Отвори предмет
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SubjectCard;
