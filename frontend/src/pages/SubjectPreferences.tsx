import { useEffect, useState } from "react";
import { fetchPreferences } from "../api/preferences";
import { fetchSubjects } from "../api/subjects";
import SkeletonCard from "../components/SubjectCatalog/SkeletonCard";
import SubjectList from "../components/SubjectCatalog/SubjectList";
import SubjectModal from "../components/SubjectCatalog/SubjectModal";
import { getSubjectPrerequisites } from "../components/SubjectCatalog/utils";
import { Subject } from "../components/types";
import { usePreferences } from "../context/PreferencesContext";
import { useSubjects } from "../context/SubjectsContext";
import { useAuth } from "../hooks/useAuth";

const SubjectPreferences = () => {
	const [subjects, setSubjects] = useSubjects();
	const { accessToken } = useAuth();
	const {
		favoriteIds,
		setDislikedIds,
		likedIds,
		setLikedIds,
		dislikedIds,
		setFavoriteIds,
	} = usePreferences();
	const [visibleCourses, setVisibleCourses] = useState<number>(12);
	const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
	const [idsToMap, setIdsToMap] = useState<Map<number, string>>();
	const [activeFilter, setActiveFilter] = useState<
		"favorite" | "liked" | "disliked"
	>("favorite");

	useEffect(() => {
		if (!subjects || subjects.length === 0) {
			fetchSubjects({ setSubjects });
		}
	}, []);

	const favoriteIDsToMap = () => {
		if (!favoriteIds) return new Map<number, string>();
		const map = new Map<number, string>();
		subjects.forEach((subject) => {
			if (favoriteIds.has(subject.id)) {
				map.set(subject.id, subject.name);
			}
		});
		return map;
	};

	const likedIDsToMap = () => {
		if (!likedIds) return new Map<number, string>();
		const map = new Map<number, string>();
		subjects.forEach((subject) => {
			if (likedIds?.has(subject.id)) {
				map.set(subject.id, subject.name);
			}
		});
		return map;
	};

	const dislikedIDsToMap = () => {
		if (!dislikedIds) return new Map<number, string>();
		const map = new Map<number, string>();
		subjects.forEach((subject) => {
			if (dislikedIds.has(subject.id)) {
				map.set(subject.id, subject.name);
			}
		});
		return map;
	};

	useEffect(() => {
		if (!accessToken) return;
		fetchPreferences({
			setDislikedIds,
			setFavoriteIds,
			setLikedIds,
		});
	}, [accessToken]);

	const favoriteSubjects = () => {
		if (!favoriteIds) return [];
		return subjects.filter((subject) => favoriteIds.has(subject.id));
	};

	const likedSubjects = () => {
		if (!likedIds) return [];
		return subjects.filter((subject) => likedIds.has(subject.id));
	};

	const dislikedSubjects = () => {
		if (!dislikedIds) return [];
		return subjects.filter((subject) => dislikedIds.has(subject.id));
	};

	useEffect(() => {
		if (!subjects || subjects.length === 0 || favoriteIds === undefined) return;
		let newSubjects: Subject[] = [];
		let newMap: Map<number, string> = new Map();
		switch (activeFilter) {
			case "favorite":
				newSubjects = favoriteSubjects();
				newMap = favoriteIDsToMap();
				break;
			case "liked":
				newSubjects = likedSubjects();
				newMap = likedIDsToMap();
				break;
			case "disliked":
				newSubjects = dislikedSubjects();
				newMap = dislikedIDsToMap();
				break;
		}
		setSelectedSubjects(newSubjects);
		setIdsToMap(newMap);
		setIsLoaded(true);
	}, [favoriteIds, likedIds, dislikedIds, activeFilter, subjects]);

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

	const handleFilterClick = (filterType: "favorite" | "liked" | "disliked") => {
		setActiveFilter(filterType);
		setVisibleCourses(12); // Reset visible courses when switching filters
	};

	return (
		<div className="min-h-[83vh] bg-white p-4">
			<h1 className="text-3xl font-bold">Мои предмети</h1>
			<div className="py-6">
				<div className="flex flex-col lg:flex-row gap-5">
					<div className="lg:w-64 flex-shrink-0">
						<div className="bg-gray-50 rounded-xl shadow-md border border-gray-200 p-4">
							<h2 className="text-lg font-semibold text-gray-900 mb-6">
								Филтри
							</h2>
							<div className="space-y-3">
								<button
									className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
										activeFilter === "favorite"
											? "bg-blue-600 text-white shadow-md"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
									onClick={() => handleFilterClick("favorite")}
								>
									Омилени предмети
								</button>
								<button
									className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
										activeFilter === "liked"
											? "bg-blue-600 text-white shadow-md"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
									onClick={() => handleFilterClick("liked")}
								>
									Позитивни оценки
								</button>
								<button
									className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
										activeFilter === "disliked"
											? "bg-blue-600 text-white shadow-md"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
									onClick={() => handleFilterClick("disliked")}
								>
									Негативни оценки
								</button>
							</div>
						</div>
					</div>

					<div className="flex-1 mr-4">
						<div className="bg-gray-50 rounded-xl shadow-md border border-gray-200 p-6">
							{!isLoaded ? (
								<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
									{[...Array(9)].map((_, index) => (
										<SkeletonCard key={index} />
									))}
								</div>
							) : selectedSubjects.length === 0 ? (
								<div className="text-center text-gray-500 py-44">
									Нема предмети за прикажување со избраниот филтер.
								</div>
							) : (
								<>
									<SubjectList
										filteredSubjects={selectedSubjects}
										visibleCourses={visibleCourses}
										openSubjectDetails={openSubjectDetails}
										from="subject-preferences"
										canReview={activeFilter !== "favorite"}
									/>
									{selectedSubjects.length > visibleCourses && (
										<div className="mt-8 text-center">
											<button
												onClick={loadMore}
												className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
											>
												Погледни повеќе
											</button>
										</div>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			</div>

			{showModal && selectedSubject && (
				<SubjectModal
					selectedSubject={selectedSubject}
					closeModal={closeModal}
					subjectPrerequisites={getSubjectPrerequisites(
						selectedSubject,
						idsToMap
					)}
					from="subject-preferences"
				/>
			)}
		</div>
	);
};

export default SubjectPreferences;
