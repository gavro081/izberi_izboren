import { Subject } from "./types";

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
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
			{filteredSubjects.slice(0, visibleCourses).map((subject) => (
				<div
					key={subject.id}
					className="border border-gray-200 rounded-lg overflow-hidden shadow-sm 
                                    hover:shadow-md transition-shadow duration-200"
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

						<div className="flex flex-wrap gap-2 mb-4">
							{/* these tags are for listing the domains a subject covers, ex. backend, AI ...*/}
							{["Web Development", "Machine Learning", "Data Science"].map(
								(tag) => (
									<span
										key={tag}
										className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
									>
										{tag}
									</span>
								)
							)}
						</div>

						<div className="flex justify-end mt-auto">
							{/* these tags could be used as certain flags for some subjects, like most picked subject, best match etc. */}
							{/* <div className="flex gap-3">
								<div className="bg-red-500 px-1 py-1 rounded-full text-sm font-medium">
									TAG1
								</div>
								<div className="bg-green-500 px-1 py-1 rounded-full text-sm font-medium">
									TAG2
								</div>
							</div> */}
							<button
								onClick={() => openSubjectDetails(subject)}
								className="flex items-center text-sm text-gray-700 hover:text-gray-900"
							>
								<img src="src/assets/eye.svg" className="w-4 h-4 mr-1" />
								Погледни детали
							</button>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export default SubjectList;
