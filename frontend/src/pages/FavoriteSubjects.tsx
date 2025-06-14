import { useEffect, useMemo, useState } from "react";
import { Subject } from "../components/types";
import SkeletonCard from "../components/SubjectCatalog/SkeletonCard";
import SubjectList from "../components/SubjectCatalog/SubjectList";
import SubjectModal from "../components/SubjectCatalog/SubjectModal";
import { useFavorites } from "../context/FavoritesContext";
import { useSubjects } from "../context/SubjectsContext";
import { getSubjectPrerequisites } from "../components/SubjectCatalog/utils";

const FavoriteSubjects = () => {
	const [subjects] = useSubjects();
	const { favoriteIds } = useFavorites();
	const [visibleCourses, setVisibleCourses] = useState<number>(12);
	const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [showModal, setShowModal] = useState(false);

	useEffect(() => {
		if (subjects && subjects.length > 0) {
			setIsLoaded(true);
		}
	}, [subjects]);

	const favoriteIDsToMap = useMemo(() => {
		const map = new Map<number, string>();
		subjects.forEach((subject) => {
			if (favoriteIds.has(subject.id)) {
				map.set(subject.id, subject.name);
			}
		});
		return map;
	}, [subjects, favoriteIds]);

	const favoriteSubjects = useMemo(() => {
		return subjects.filter((subject) => favoriteIds.has(subject.id));
	}, [subjects, favoriteIds]);

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
			{favoriteSubjects.length > 0 && (
				<div className="mb-8 flex justify-center">
					<div className="px-12 py-8 rounded-2xl shadow-lg border-4 border-blue-500 hover:shadow-xl  hover:scale-105 hover:border-blue-700 transition-all duration-300">
						<div className="flex items-center justify-center gap-4">
							<div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
								<svg
									className="w-7 h-7 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={3}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
							<p className="text-gray-800 font-bold text-2xl">
								{favoriteSubjects.length === 1
									? "Имаш 1 омилен предмет!"
									: `Имаш ${favoriteSubjects.length} омилени предмети!`}
							</p>
						</div>
					</div>
				</div>
			)}

			<div className="flex flex-col md:flex-row gap-6">
				<div className="flex-1">
					{!isLoaded ? (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
							{[...Array(9)].map((_, index) => (
								<SkeletonCard key={index} />
							))}
						</div>
					) : (
						<SubjectList
							filteredSubjects={favoriteSubjects}
							visibleCourses={visibleCourses}
							openSubjectDetails={openSubjectDetails}
						/>
					)}

					{isLoaded && favoriteSubjects.length > visibleCourses && (
						<div className="mt-5 text-center">
							<button
								onClick={loadMore}
								className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
							>
								Погледни повеќе
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
						favoriteIDsToMap
					)}
				/>
			)}
		</div>
	);
};

export default FavoriteSubjects;
