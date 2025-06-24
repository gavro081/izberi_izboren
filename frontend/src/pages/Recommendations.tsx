import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import SubjectCard from "../components/SubjectCatalog/SubjectCard";
import SubjectModal from "../components/SubjectCatalog/SubjectModal";
import { getSubjectPrerequisites } from "../components/SubjectCatalog/utils";
import { Subject } from "../components/types";
import { usePreferences } from "../context/PreferencesContext";
import { useRecommendations } from "../context/RecommendationsContext";
import { useSubjects } from "../context/SubjectsContext";
import { useAuth } from "../hooks/useAuth";

const Recommendations = () => {
	const navigate = useNavigate();
	const { setFavoriteIds, setLikedIds, setDislikedIds } = usePreferences();
	const { formData } = useAuth();
	const { accessToken } = useAuth();
	const [subjects] = useSubjects();
	const [recommendations, setRecommendations] = useRecommendations();
	const [season_, setSeason] = useState<"winter" | "summer" | "all">("all");
	const [isLoading, setIsLoading] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const mapToSeasonInt = (season: "winter" | "summer" | "all") => {
		if (season == "summer") return 0;
		if (season == "winter") return 1;
		return 2;
	};

	const fetchRecommendations = async () => {
		setIsLoading(true);
		try {
			const season = mapToSeasonInt(season_);
			const response = await axiosInstance.get("/suggestion", {
				params: { season },
			});
			setRecommendations(response.data.data);
		} catch (error) {
			console.error("Error fetching recommendations:", error);
		} finally {
			setIsLoading(false);
			setHasSearched(true);
			const container = document.querySelector(".flex-1.p-8.overflow-y-auto");
			if (container) {
				container.scrollTo({ top: 0, behavior: "smooth" });
			}
		}
	};

	// (new) Now we use the context to get the subjects, but we can also fetch them directly from the backend if needed!
	// (old) need to fetch subject data so that we can compare the subject IDs (prerequisites store IDs, but we need names) in the modals for the recommendations
	// useEffect(() => {
	// 	const fetchData = async () => {
	// 		const response = await fetch("http://localhost:8000/subjects");
	// 		const data = await response.json();
	// 		setSubjects(data);
	// 	};
	// 	fetchData();
	// 	if (subjects.length == 0) fetchData();
	// }, []);

	const subjectIdToNameMap = useMemo(() => {
		const map = new Map<number, string>();
		subjects.forEach((subject) => {
			map.set(subject.id, subject.name);
		});
		return map;
	}, [subjects]);

	const cycleSeason = () => {
		if (season_ === "all") setSeason("winter");
		else if (season_ === "winter") setSeason("summer");
		else setSeason("all");
	};

	const openSubjectView = (subject: Subject) => {
		navigate(`/subjects/${subject.code}`, {
			state: { from: "/recommendations" },
		});
	};

	const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

	const openSubjectDetails = (subject: Subject) => {
		setSelectedSubject(subject);
		setShowModal(true);
	};

	const closeModal = () => {
		setSelectedSubject(null);
		setShowModal(false);
	};

	const getSeasonText = () => {
		switch (season_) {
			case "winter":
				return "Зимски";
			case "summer":
				return "Летен";
			case "all":
				return "Зимски + Летен";
		}
	};

	useEffect(() => {
		const accessToken = localStorage.getItem("access");
		if (accessToken) {
			setIsLoading(true);
			axiosInstance
				.get<{
					favorite_ids: number[];
					liked_ids: number[];
					disliked_ids: number[];
				}>("/student/preferences/")
				.then((response) => {
					setFavoriteIds(new Set(response.data.favorite_ids || []));
					setLikedIds(new Set(response.data.liked_ids || []));
					setDislikedIds(new Set(response.data.disliked_ids || []));
				})
				.catch((error) => console.error("Failed to fetch preferences:", error))
				.finally(() => setIsLoading(false));
		} else {
			setFavoriteIds(new Set());
			setLikedIds(new Set());
			setDislikedIds(new Set());
			setIsLoading(false);
		}
	}, [accessToken]);

	return (
		<>
			{formData?.has_filled_form === false ? (
				<div className="flex h-[90vh] bg-white">
					<div className="text-red-500 font-bold text-2xl text-center flex-1 flex items-center justify-center">
						Пополни информации за твојот профил за да добиеш препораки!
					</div>
				</div>
			) : (
				<div className="flex h-[90vh] bg-gray-50">
					<div className="w-1/3 bg-white shadow-lg p-8 flex flex-col justify-center items-center space-y-8">
						<div className="text-center">
							<h1 className="text-4xl font-bold text-gray-800 mb-2">
								Препораки
							</h1>
							<p className="text-gray-600 text-lg">
								Предметите што ќе ги добиеш од алгоритамот се базирани на тоа
								што си го пополнил во формата.
								<br />
								Тие се подредени според тоа колку твоите интереси се совпаѓаат
								со тоа што го нудат предметите.
							</p>
						</div>

						<button onClick={cycleSeason}>
							<div className="bg-blue-500 border border-blue-200 rounded-lg p-6 font-semibold text-white text-center hover:bg-blue-800 transition-colors duration-200">
								<p className="text-white mb-3">
									{season_ === "all" ? "Избрани семестри:" : "Избран семестар:"}
								</p>
								<p className="text-2xl">{getSeasonText()}</p>
							</div>
						</button>

						<button
							onClick={fetchRecommendations}
							disabled={isLoading}
							className={`${
								isLoading
									? "bg-gray-400 cursor-not-allowed"
									: "bg-green-500 hover:bg-green-600 hover:scale-105 shadow-md hover:shadow-lg"
							} text-white px-8 py-4 rounded-lg text-xl font-bold transition-all duration-200 flex items-center space-x-2`}
						>
							{isLoading ? (
								<>
									<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
									<span>Се вчитува...</span>
								</>
							) : (
								<span>Вчитај препораки!</span>
							)}
						</button>
					</div>

					<div className="flex-1 p-8 overflow-y-auto">
						{recommendations.length > 0 ? (
							<div className="space-y-6">
								<div className="text-center mb-8">
									<h2 className="text-3xl font-bold text-gray-800 mb-2">
										Вашите препораки за {getSeasonText().toLowerCase()}{" "}
										{getSeasonText().toLowerCase() === "Зимски + Летен"
											? "семестри"
											: "семестар"}
									</h2>
									<p className="text-gray-500">
										Помогни ни да ги подобриме алгоритамот со тоа што ќе ги
										оцениш препораките
									</p>
									{/* <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div> */}
								</div>

								<div
									// className={`grid grid-cols-1 lg:grid-cols-2 gap-3 lg:h-[1150px]`}
									className={`grid grid-cols-1 lg:grid-cols-2 gap-3 auto-rows-[300px] relative pb-4`}
								>
									{recommendations.map((subject, index) => (
										<div
											key={subject.id}
											className={`border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 relative ${
												index % 2 === 0 ? "self-start" : "self-end"
											}`}
											style={{
												animationName: "fadeInUp",
												animationDuration: "0.6s",
												animationTimingFunction: "ease-out",
												animationFillMode: "forwards",
												animationDelay: `${index * 100}ms`,
											}}
										>
											<SubjectCard
												subject={subject}
												openSubjectDetails={openSubjectDetails}
												openSubjectView={openSubjectView}
												canReview={true}
												isFirst={index == 0}
												isRecommended={true}
											/>
										</div>
									))}
								</div>
								<div className="absolute bottom-0 right-0 h-24 w-full pointer-events-none bg-gradient-to-t from-gray-50 to-transparent" />
							</div>
						) : !hasSearched ? (
							<div className="flex flex-col items-center justify-center h-full text-center">
								<div className="mb-6 text-gray-400">
									<img
										src="src/assets/search.svg"
										className="w-16 h-16 mx-auto"
									/>
								</div>
								<h3 className="text-2xl font-bold text-gray-600 mb-4">
									Започнете со пребарување!
								</h3>
								<p className="text-gray-500 text-lg max-w-md">
									Изберете ја саканата сезона и кликнете на "Вчитај препораки"
									за да ги откриете вашите идеални предмети!
								</p>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center h-full text-center">
								<h3 className="text-2xl font-bold text-gray-600 mb-4">
									Моментално немаме препораки за тебе :(
								</h3>
								<p className="text-gray-500 text-lg max-w-md">
									Направи промени во профилот и обиди се повторно.
								</p>
							</div>
						)}
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
			)}
		</>
	);
};

export default Recommendations;
