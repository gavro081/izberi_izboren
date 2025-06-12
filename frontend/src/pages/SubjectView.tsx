import { ArrowLeft, Tag, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getSubjectPrerequisites } from "../components/SubjectCatalog/utils";
import SkeletonSubjectView from "../components/SubjectView/SkeletonSubjectView";
import { Subject } from "../components/types";
import { EVALUATION_MAP_TO_MK } from "../constants/subjects";

function SubjectView() {
	const [selectedSubject, setSelectedSubject] = useState<Subject>(
		{} as Subject
	);
	const [subjectPrerequisites, setSubjectPrerequisites] = useState<
		"Нема предуслов" | number | string
	>("Нема предуслов");
	const [isLoading, setIsLoading] = useState(true);
	const [isExpanded, setIsExpanded] = useState(false);
	const [filteredTechonologies, setFilteredTechnologies] = useState([]);
	const { code } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const WORD_LIMIT = 40;

	const from = location.state?.from || "/";

	const truncateText = (text: string) => {
		if (!text) return "";
		const words = text.split(/\s+/);
		return words.length <= WORD_LIMIT
			? text
			: words.slice(0, WORD_LIMIT).join(" ") + "...";
	};

	const canToggle =
		selectedSubject.code &&
		selectedSubject.abstract.split(/\s+/).length > WORD_LIMIT;
	const abstractText = isExpanded
		? selectedSubject.abstract
		: truncateText(selectedSubject.abstract);

	const handleGoBack = () => {
		navigate(from);
	};

	useEffect(() => {
		fetch(`http://localhost:8000/subjects/${code}/`)
			.then((res) => res.json())
			.then((data) => {
				setSelectedSubject(data);
				const technologies = data.subject_info.technologies.map(
					(tech: string) => (tech === "any" ? "По избор" : tech)
				);
				const filtered = technologies.filter(
					(tech: string) => tech !== "По избор"
				);
				if (technologies.includes("По избор")) {
					filtered.push("По избор");
				}
				setFilteredTechnologies(filtered);
				setSubjectPrerequisites(getSubjectPrerequisites(selectedSubject, data));
				setIsLoading(false);
			});
	}, []);
	if (isLoading) return <SkeletonSubjectView />;

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="bg-white shadow-sm">
				<div className="max-w-6xl mx-auto px-4 py-4">
					<button
						onClick={handleGoBack}
						className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
					>
						<ArrowLeft className="w-5 h-5 mr-2" />
						Назад кон
						{from == "/subjects"
							? " сите предмети"
							: from == "/recommendations"
							? " препораките"
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

						{/* <div className="mt-4 sm:mt-0">
							<div className="flex items-center space-x-4 text-sm text-gray-500">
								<div className="flex items-center">
									<Calendar className="w-4 h-4 mr-1" />
									{subject.subject_info.season === "S"
										? "Летен"
										: "Зимски"}{" "}
									семестар
								</div>
								<div className="flex items-center">
									<BookOpen className="w-4 h-4 mr-1" />L
									{subject.subject_info.level} ниво
								</div>
							</div>
						</div> */}
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

						{/* Tags */}
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

						{/* <div className="bg-white rounded-lg shadow-sm p-6">
							<div className="space-y-3">
								<button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
									Запиши предмет
								</button>
								<button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors">
									Додај во омилени
								</button>
								<button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors">
									Сподели
								</button>
							</div>
						</div> */}
					</div>
				</div>
			</div>
		</div>
	);
}

export default SubjectView;
