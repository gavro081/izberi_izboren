import {
	ArrowLeft,
	Tag,
	// ThumbsDown,
	// ThumbsUp,
	Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { fetchSubjects } from "../api/subjects";
import EvaluationReviews from "../components/Reviews/EvaluationReviews";
import OtherReviews from "../components/Reviews/OtherReviews";
import { getSubjectPrerequisites } from "../components/SubjectCatalog/utils";
import SkeletonSubjectView from "../components/SubjectView/SkeletonSubjectView";
import { Reviews } from "../components/types";
import { EVALUATION_MAP_TO_MK } from "../constants/subjects";
import { useSubjects } from "../context/SubjectsContext";

function SubjectView() {
	const [subjectPrerequisites, setSubjectPrerequisites] = useState<
		"Нема предуслов" | number | string
	>("Нема предуслов");
	const [isExpanded, setIsExpanded] = useState(false);
	const [reviews, setReviews] = useState<Reviews>({} as Reviews);
	const [filteredTechonologies, setFilteredTechnologies] = useState<string[]>(
		[]
	);
	const { code } = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const [subjects, setSubjects] = useSubjects();

	// useMemo makes this efficient, so it only re-calculates when subjects or code changes.
	const selectedSubject = useMemo(() => {
		return subjects.find((subject) => subject.code === code);
	}, [subjects, code]);

	useEffect(() => {
		if (!selectedSubject) return;
		(async () => {
			try {
				const response = await axiosInstance.get<Reviews>(
					`subjects/subject-review/${selectedSubject?.code}`
				);
				setReviews(response.data);
			} catch (err) {
				console.error("Error: ", err);
			}
		})();
	}, [selectedSubject]);

	useEffect(() => {
		fetchSubjects(setSubjects);
	}, []);

	const WORD_LIMIT = 40;
	const from = location.state?.from || "/";

	const truncateText = (text: string) => {
		if (!text) return "";
		const words = text.split(/\s+/);
		return words.length <= WORD_LIMIT
			? text
			: words.slice(0, WORD_LIMIT).join(" ") + "...";
	};

	const abstractText = isExpanded
		? selectedSubject?.abstract
		: truncateText(selectedSubject?.abstract ?? "");

	const canToggle =
		selectedSubject &&
		selectedSubject.abstract.split(/\s+/).length > WORD_LIMIT;

	useEffect(() => {
		if (selectedSubject) {
			const technologies = selectedSubject.subject_info.technologies.map(
				(tech: string) => (tech === "any" ? "По избор" : tech)
			);
			const filtered = technologies.filter(
				(tech: string) => tech !== "По избор"
			);
			if (technologies.includes("По избор")) {
				filtered.push("По избор");
			}
			setFilteredTechnologies(filtered);
			const subjectIdToNameMap = new Map(subjects.map((s) => [s.id, s.name]));
			setSubjectPrerequisites(
				getSubjectPrerequisites(selectedSubject, subjectIdToNameMap)
			);
		}
	}, [selectedSubject, subjects]);

	// We are "loading" if the global subjects context hasn't populated yet.
	if (subjects.length === 0) {
		return <SkeletonSubjectView />;
	}

	// Handle case where the subject code is not found in our global list
	if (!selectedSubject) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[83vh] bg-white text-center">
				<p className="text-2xl font-semibold mb-6">
					Предметот со код '{code}' не е пронајден.
				</p>
				<Link
					to="/subjects"
					className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
				>
					Кон предмети
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="bg-white shadow-sm">
				<div className="max-w-6xl mx-auto px-4 py-4">
					<button
						onClick={() => navigate(from)}
						className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
					>
						<ArrowLeft className="w-5 h-5 mr-2" />
						Назад кон
						{from == "/subjects"
							? " сите предмети"
							: from == "/recommendations"
							? " препораките"
							: from == "/subject-preferences"
							? " омилените предмети"
							: " домашната страна"}
					</button>

					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								{selectedSubject.name}
							</h1>
							<p className="text-lg text-gray-600 mt-1">
								{selectedSubject.code}
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-4 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-8">
						<div className="bg-white rounded-lg shadow-sm p-6">
							<h2 className="text-xl font-semibold mb-4">Опис на предметот</h2>
							<div className="text-gray-700 leading-relaxed">
								<span>{abstractText}</span>
								{canToggle && (
									<button
										className="text-blue-600 hover:text-blue-800 ml-2 font-medium"
										onClick={() => setIsExpanded(!isExpanded)}
									>
										{isExpanded ? "Прочитај помалку" : "Прочитај повеќе"}
									</button>
								)}
							</div>
						</div>

						<div className="bg-white rounded-lg shadow-sm p-6">
							<h2 className="text-xl font-semibold mb-6">Наставен кадар</h2>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<h3 className="text-lg font-medium mb-3 text-gray-900">
										Професори
									</h3>
									{selectedSubject.subject_info.professors.length === 0 ? (
										<p className="text-gray-500">Нема одредени професори</p>
									) : (
										<ul className="space-y-2">
											{selectedSubject.subject_info.professors.map(
												(professor, index) => (
													<li key={index} className="text-gray-700">
														{professor}
													</li>
												)
											)}
										</ul>
									)}
								</div>

								<div>
									<h3 className="text-lg font-medium mb-3 text-gray-900">
										Асистенти
									</h3>
									{selectedSubject.subject_info.assistants.length === 0 ? (
										<p className="text-gray-500">Нема одредени асистенти</p>
									) : (
										<ul className="space-y-2">
											{selectedSubject.subject_info.assistants.map(
												(assistant, index) => (
													<li key={index} className="text-gray-700">
														{assistant}
													</li>
												)
											)}
										</ul>
									)}
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg shadow-sm p-6">
							<h2 className="text-xl font-semibold mb-4">
								Информации за запишување
							</h2>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<h3 className="text-lg font-medium mb-3 text-gray-900">
										Задолжителен за:
									</h3>
									{selectedSubject.subject_info.mandatory_for.length === 0 ? (
										<p className="text-gray-500">Не е задолжителен предмет</p>
									) : (
										<ul className="space-y-1">
											{selectedSubject.subject_info.mandatory_for
												.map((s) => s.replace(/\d+$/, ""))
												.map((program, index) => (
													<li key={index} className="text-gray-700">
														{program}
													</li>
												))}
										</ul>
									)}
								</div>

								<div>
									<h3 className="text-lg font-medium mb-3 text-gray-900">
										Изборен за:
									</h3>
									{selectedSubject.subject_info.elective_for.length === 0 ? (
										<p className="text-gray-500">Не е изборен предмет</p>
									) : (
										<ul className="space-y-1">
											{selectedSubject.subject_info.elective_for
												.map((s) => s.replace(/\d+$/, ""))
												.map((program, index) => (
													<li key={index} className="text-gray-700">
														{program}
													</li>
												))}
										</ul>
									)}
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg shadow-sm p-6">
							<h2 className="text-xl font-semibold mb-4 flex items-center">
								<Tag className="w-5 h-5 mr-2" />
								Домени
							</h2>
							<div className="flex flex-wrap gap-3">
								{selectedSubject.subject_info.tags.map((tag, index) => (
									<span
										key={index}
										className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium"
									>
										{tag}
									</span>
								))}
							</div>
						</div>

						<div className="bg-white rounded-lg shadow-sm p-6">
							{!reviews ||
							!reviews.evaluation ||
							!reviews.other ? null : reviews.evaluation?.methods?.length ==
									0 && reviews.other.length == 0 ? (
								<p>Нема информации од студенти за овој предмет.</p>
							) : (
								<>
									<h2 className="text-xl font-semibold mb-6">
										Информации од студенти
									</h2>
									{reviews.evaluation.methods.length > 0 && (
										<EvaluationReviews evaluation_review={reviews.evaluation} />
									)}
									{reviews.other.length > 0 && (
										<OtherReviews other_reviews={reviews.other} />
									)}
								</>
							)}
							<div className="mt-6 pt-4 border-gray-200">
								<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
									Сподели мислење
								</button>
							</div>
						</div>
					</div>

					<div className="space-y-6">
						<div className="bg-white rounded-lg shadow-sm p-6">
							<h2 className="text-xl font-semibold mb-6">
								Информации за предметот
							</h2>
							<div className="space-y-4">
								<div>
									<p className="text-sm text-gray-500 mb-1">
										Препорачан семестар
									</p>
									<p className="font-medium text-lg">
										{selectedSubject.subject_info.semester}
									</p>
								</div>

								<div>
									<p className="text-sm text-gray-500 mb-1">Семестар</p>
									<p className="font-medium">
										{selectedSubject.subject_info.season === "S"
											? "Летен"
											: "Зимски"}
									</p>
								</div>

								<div>
									<p className="text-sm text-gray-500 mb-1">Ниво</p>
									<p className="font-medium">
										L{selectedSubject.subject_info.level}
									</p>
								</div>

								<div>
									<p className="text-sm text-gray-500 mb-1">Предуслови</p>
									<p className="font-medium">
										{typeof subjectPrerequisites === "string"
											? subjectPrerequisites
											: typeof subjectPrerequisites === "number"
											? `${subjectPrerequisites} кредити`
											: "Нема предуслов"}
									</p>
								</div>

								<div>
									<p className="text-sm text-gray-500 mb-1">Технологии</p>
									<p className="font-medium">
										{filteredTechonologies.length
											? filteredTechonologies.join(", ")
											: "Нема одредени технологии"}
									</p>
								</div>

								<div>
									<p className="text-sm text-gray-500 mb-1">
										Начин на евалуација
									</p>
									<p className="font-medium">
										{selectedSubject.subject_info.evaluation.length
											? selectedSubject.subject_info.evaluation
													.map(
														(ev) =>
															EVALUATION_MAP_TO_MK[
																ev as keyof typeof EVALUATION_MAP_TO_MK
															]
													)
													.join(", ")
											: "Нема одредена евалуација"}
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg shadow-sm p-6">
							<h3 className="text-lg font-semibold mb-4 flex items-center">
								<Users className="w-5 h-5 mr-2" />
								Статистики
							</h3>

							{selectedSubject.subject_info.participants[0] === 0 ? (
								<div className="bg-red-50 border border-red-200 rounded-lg p-4">
									<p className="text-red-800 font-medium">
										Овој предмет не бил активиран минатиот семестар.
									</p>
								</div>
							) : (
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
									<p className="text-blue-800">
										Овој предмет минатиот семестар бил запишан од{" "}
										<span className="font-bold">
											{selectedSubject.subject_info.participants[0]}
										</span>{" "}
										студенти.
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SubjectView;
