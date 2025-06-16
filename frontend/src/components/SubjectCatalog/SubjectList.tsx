import { useNavigate } from "react-router-dom";
import { Subject } from "../types";
import SubjectCard from "./SubjectCard";

interface SubjectListProps {
	filteredSubjects: Subject[];
	visibleCourses: number;
	openSubjectDetails: (subject: Subject) => void;
	from: string;
	canReview?: boolean;
}

const SubjectList = ({
	filteredSubjects,
	visibleCourses,
	openSubjectDetails,
	from,
	canReview = false,
}: SubjectListProps) => {
	const navigate = useNavigate();
	const openSubjectView = (subject: Subject) => {
		navigate(`/subjects/${subject.code}`, {
			state: { from: `/${from}` },
		});
	};
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
			{filteredSubjects.slice(0, visibleCourses).map((subject) => (
				<SubjectCard
					key={subject.id}
					subject={subject}
					openSubjectDetails={openSubjectDetails}
					openSubjectView={openSubjectView}
					canReview={canReview}
				/>
			))}
		</div>
	);
};

export default SubjectList;
