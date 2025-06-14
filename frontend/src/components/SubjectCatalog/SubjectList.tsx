import { useNavigate } from "react-router-dom";
import { Subject } from "../types";
import FavoriteButton from "./FavoriteButton";

interface SubjectListProps {
	filteredSubjects: Subject[];
	visibleCourses: number;
	openSubjectDetails: (subject: Subject) => void;
}

const SubjectList = ({
	filteredSubjects,
	visibleCourses,
	openSubjectDetails,
}: SubjectListProps) => {
	const navigate = useNavigate();
	const openSubjectView = (subject: Subject) => {
		navigate(`/subjects/${subject.code}`);
	};
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
			{filteredSubjects.slice(0, visibleCourses).map((subject) => (
				<div
					key={subject.id}
					className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
				>
					<div className="p-4 min-h-full flex flex-col gap-1">
						<div className="flex justify-between items-start mb-2">
							<div>
								<h3 className="text-lg font-semibold">{subject.name}</h3>
								<p className="text-gray-600">{subject.code}</p>
							</div>
						</div>
						{/* <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            				{subject.abstract}
          					</p> */}
						{/* <div className="flex flex-wrap gap-2 mb-4">
							{subject.subject_info.tags.map((tag) => (
								<span
									key={tag}
									className="bg-green-100 border-green-300 text-green-800 text-xs px-2 py-1 rounded"
								>
									{tag}
								</span>
							))}
						</div> */}
						<div className="flex justify-between mt-auto gap-3">
							<div className="flex items-center gap-2">
								<button onClick={() => openSubjectDetails(subject)}>
									<img src="src/assets/eye.svg" className="w-5 h-5" />
								</button>
								<FavoriteButton subjectId={subject.id} />
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
			))}
		</div>
	);
};

export default SubjectList;
