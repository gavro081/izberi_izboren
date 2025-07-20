import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { fetchPreferences } from "../api/preferences";
import { fetchSubjects } from "../api/subjects";
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
	const { setDislikedIds, setFavoriteIds, setLikedIds } = usePreferences();
	const [isLoading, setIsLoading] = useState(false);
	const { formData } = useAuth();
	const { accessToken } = useAuth();
	const [subjects, setSubjects] = useSubjects();
	const [recommendations, setRecommendations] = useRecommendations();
	const [recommendationsLoaded, setRecommendationsLoaded] = useState(true);
	const [season_, setSeason] = useState<"winter" | "summer" | "all">("all");
	const [includeNotActivated, setIncludeNotActivated] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);

	const mapToSeasonInt = (season: "winter" | "summer" | "all") => {
		if (season == "summer") return 0;
		if (season == "winter") return 1;
		return 2;
	};

	useEffect(() => {
		if (!subjects || subjects.length === 0) {
			fetchSubjects(setSubjects);
		}
	}, [subjects, setSubjects]);

	const fetchRecommendations = async () => {
		setRecommendationsLoaded(false);
		try {
			const season = mapToSeasonInt(season_);
			const notActivated = includeNotActivated ? 1 : 0;
			const response = await axiosInstance.get("subjects/recommendations/", {
				params: { season, not_activated: notActivated },
			});
			setRecommendations(response.data.data);
		} catch (error) {
			console.error("Error fetching recommendations:", error);
		} finally {
			setRecommendationsLoaded(true);
			setHasSearched(true);
			const container = document.querySelector(".hide-scrollbar");
			if (container) {
				container.scrollTo({ top: 0, behavior: "smooth" });
			}
		}
	};

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
		if (!accessToken) return;
		fetchPreferences({
			setIsLoading,
			setDislikedIds,
			setFavoriteIds,
			setLikedIds,
		});
	}, [accessToken, setDislikedIds, setFavoriteIds, setLikedIds]);

	return (
		<>
			{formData?.has_filled_form === false ? (
				<div className="flex min-h-[90vh] bg-white p-4">
					<div className="text-red-500 font-bold text-xl md:text-2xl text-center flex-1 flex items-center justify-center">
						Пополни информации за твојот профил за да добиеш препораки!
					</div>
				</div>
			) : (
				<div className="flex flex-col lg:flex-row lg:h-[90vh] bg-gray-50">
					<div className="w-full lg:w-1/3 bg-white shadow-lg p-6 lg:p-8 flex flex-col justify-center items-center space-y-6 lg:space-y-8">
						<div className="text-center">
							<h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
								Препораки
							</h1>
							<p className="text-gray-600 text-base lg:text-lg">
								Предметите што ќе ги добиеш од алгоритамот се базирани на тоа
								што си го пополнил во формата.
								<br />
								Тие се подредени според тоа колку твоите интереси се совпаѓаат
								со тоа што го нудат предметите.
							</p>
						</div>
						<button onClick={cycleSeason}>
							<div className="bg-blue-500 border border-blue-200 rounded-lg p-4 md:p-6 font-semibold text-white text-center hover:bg-blue-800 transition-colors duration-200">
								<p className="text-white mb-2 md:mb-3">
									{season_ === "all" ? "Избрани семестри:" : "Избран семестар:"}
								</p>
								<p className="text-xl md:text-2xl">{getSeasonText()}</p>
							</div>
						</button>
						<button
							onClick={fetchRecommendations}
							disabled={!recommendationsLoaded}
							className={`${
								!recommendationsLoaded
									? "bg-gray-400 cursor-not-allowed"
									: "bg-green-500 hover:bg-green-600 hover:scale-105 shadow-md hover:shadow-lg"
							} text-white px-6 py-3 lg:px-8 lg:py-4 rounded-lg text-lg lg:text-xl font-bold transition-all duration-200 flex items-center space-x-2`}
						>
							{!recommendationsLoaded ? (
								<>
									<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
									<span>Се вчитува...</span>
								</>
							) : (
								<span>Вчитај препораки!</span>
							)}
						</button>
						<div className="flex flex-col items-center space-y-2 pt-4">
							<label className="flex items-center space-x-2 cursor-pointer">
								<input
									type="checkbox"
									checked={includeNotActivated}
									onChange={() => setIncludeNotActivated(!includeNotActivated)}
									className="form-checkbox h-5 w-5 text-blue-600"
								/>
								<span className="text-gray-700 text-center">
									Сакам да добивам и неактивирани предмети
								</span>
							</label>
						</div>
					</div>

					<div className="flex-1 relative">
						<div className="h-full p-4 lg:p-8 overflow-y-auto hide-scrollbar">
							{recommendations.length > 0 ? (
								<div className="space-y-6">
									<div className="text-center mb-4 md:mb-8">
										<h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
											Вашите препораки за {getSeasonText().toLowerCase()}{" "}
											{getSeasonText().toLowerCase() === "зимски + летен"
												? "семестри"
												: "семестар"}
										</h2>
										<p className="text-gray-500">
											Помогни ни да ги подобриме алгоритамот со тоа што ќе ги
											оцениш препораките
										</p>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
										{recommendations.map((subject, index) => (
											<div
												key={subject.id}
												className={`border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${
													index % 2 === 0 ? "md:mt-0" : "md:mt-8"
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
													isFirst={index === 0}
													isRecommended={true}
													isLoading={isLoading}
													recommendationDetails={subject.recommendation_details}
												/>
											</div>
										))}
									</div>
								</div>
							) : !hasSearched ? (
								<div className="flex flex-col items-center justify-center h-full text-center">
									<div className="mb-6 text-gray-400">
										<img
											src="src/assets/search.svg"
											alt="Search icon"
											className="w-16 h-16 mx-auto"
										/>
									</div>
									<h3 className="text-xl md:text-2xl font-bold text-gray-600 mb-4">
										Започнете со пребарување!
									</h3>
									<p className="text-gray-500 text-base lg:text-lg max-w-md">
										Изберете ја саканата сезона и кликнете на "Вчитај препораки"
										за да ги откриете вашите идеални предмети!
									</p>
								</div>
							) : (
								<div className="flex flex-col items-center justify-center h-full text-center">
									<h3 className="text-xl md:text-2xl font-bold text-gray-600 mb-4">
										Моментално немаме препораки за тебе :(
									</h3>
									<p className="text-gray-500 text-base lg:text-lg max-w-md">
										Направи промени во профилот и обиди се повторно.
									</p>
								</div>
							)}
						</div>
						<div className="hidden lg:block absolute bottom-0 right-0 h-24 w-full pointer-events-none bg-gradient-to-t from-gray-50 to-transparent" />
					</div>

					{showModal && selectedSubject && (
						<SubjectModal
							selectedSubject={selectedSubject}
							closeModal={closeModal}
							subjectPrerequisites={getSubjectPrerequisites(
								selectedSubject,
								subjectIdToNameMap
							)}
							from="recommendations"
						/>
					)}
				</div>
			)}
		</>
	);
};

export default Recommendations;
