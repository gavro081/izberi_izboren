import { useEffect, useMemo, useState } from "react";
import { useSubjects } from "../../context/SubjectsContext";
import { Filters, Subject } from "../types";
import FilterSidebar from "./FilterSidebar";
import SkeletonCard from "./SkeletonCard";
import StaffSearch from "./StaffSearch";
import SubjectList from "./SubjectList";
import SubjectModal from "./SubjectModal";
import {
	filterSubjects,
	getRandomStaff,
	getSubjectPrerequisites,
	resetFilters,
} from "./utils";
const SubjectCatalog = () => {
	const [subjects] = useSubjects();
	const [visibleCourses, setVisibleCourses] = useState<number>(12);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [professorSearchTerm, setProfessorSearchTerm] = useState<string>("");
	const [assistantSearchTerm, setAssistantSearchTerm] = useState<string>("");
	const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [randomStaff, setRandomStaff] = useState(["", ""]);
	const [showModal, setShowModal] = useState(false);
	const [tags, setTags] = useState<string[]>([]);
	const [filters, setFilters] = useState<Filters>({
		season: "",
		semester: [],
		level: [],
		activated: "",
		mandatoryFor: [],
		electiveFor: [],
		professors: [],
		assistants: [],
		tags: [],
		hasPrerequisites: "",
		evaluation: [],
	});
	const filteredSubjects: Subject[] = filterSubjects({
		searchTerm,
		professorSearchTerm,
		assistantSearchTerm,
		filters,
		subjects,
	});

	useEffect(() => {
		if (subjects && subjects.length > 0) {
			setIsLoaded(true);
		}
	}, [subjects]);

	useEffect(() => {
		getRandomStaff(subjects, setRandomStaff);
		setTags(
			Array.from(
				new Set(filteredSubjects.flatMap((sub) => sub.subject_info.tags))
			)
		);
	}, [subjects]);

	const subjectIdToNameMap = useMemo(() => {
		const map = new Map<number, string>();
		subjects.forEach((subject) => {
			map.set(subject.id, subject.name);
		});
		return map;
	}, [subjects]);

	const loadMore = () => {
		setVisibleCourses((prev) => prev + 12);
	};

	const openSubjectDetails = (subject: Subject) => {
		setSelectedSubject(subjects.find((item) => item.id == subject.id) ?? null);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
	};

	return (
		<div className="mx-auto p-4 bg-white min-h-screen">
			<h1 className="text-3xl font-bold mb-6">Преглед на сите предмети</h1>
			<div className="flex flex-col md:flex-row gap-6">
				<div className="w-full md:w-64 bg-gray-50 p-4 rounded-lg">
					<FilterSidebar
						setSearchTerm={setSearchTerm}
						setProfessorSearchTerm={setProfessorSearchTerm}
						setAssistantSearchTerm={setAssistantSearchTerm}
						setFilters={setFilters}
						filters={filters}
						tags={tags}
					/>
					<StaffSearch
						randomStaff={randomStaff}
						professorSearchTerm={professorSearchTerm}
						assistantSearchTerm={assistantSearchTerm}
						setProfessorSearchTerm={setProfessorSearchTerm}
						setAssistantSearchTerm={setAssistantSearchTerm}
					/>
				</div>

				<div className="flex-1">
					<div className="mb-6 relative">
						<input
							type="text"
							placeholder="Пребарувај предмети по име, код, опис"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full p-3 pl-4 pr-12 border border-gray-300 rounded-lg 
							focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					{!isLoaded ? (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
							{[...Array(9)].map((_, index) => (
								<SkeletonCard key={index} />
							))}
						</div>
					) : (
						<SubjectList
							filteredSubjects={filteredSubjects}
							visibleCourses={visibleCourses}
							openSubjectDetails={openSubjectDetails}
							from="subjects"
						/>
					)}

					{isLoaded && filteredSubjects.length > visibleCourses && (
						<div className="mt-5 text-center">
							<button
								onClick={loadMore}
								className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
							>
								Погледни повеќе
							</button>
						</div>
					)}

					{isLoaded && filteredSubjects.length === 0 && (
						<div className="text-center py-12">
							<p className="text-gray-500 text-lg">
								Не постојат такви предмети
							</p>
							<button
								onClick={() =>
									resetFilters(
										setSearchTerm,
										setProfessorSearchTerm,
										setAssistantSearchTerm,
										setFilters
									)
								}
								className="mt-2 text-blue-600 hover:text-blue-800"
							>
								Ресетирај филтри
							</button>
						</div>
					)}
				</div>
			</div>
			{showModal && selectedSubject && (
				<SubjectModal
					selectedSubject={selectedSubject}
					closeModal={closeModal}
					subjectPrerequisites={getSubjectPrerequisites(
						selectedSubject,
						subjectIdToNameMap
					)}
				/>
			)}
		</div>
	);
};

export default SubjectCatalog;
