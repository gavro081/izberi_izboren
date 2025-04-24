import { useEffect, useState } from "react";
import { PROGRAMS } from "../constants/subjects";
import { Programs, Subject } from "../types";
import SubjectModal from "./SubjectModal";
const SubjectCatalog = () => {
	const [visibleCourses, setVisibleCourses] = useState<number>(10);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [professorSearchTerm, setProfessorSearchTerm] = useState<string>("");
	const [assistantSearchTerm, setAssistantSearchTerm] = useState<string>("");
	const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
	const [subjectData, setSubjectData] = useState<Subject[]>([]);
	const [isLoaded, setIsLoaded] = useState(false);
	const [randomStaff, setRandomStaff] = useState(["", ""]);
	const [showModal, setShowModal] = useState(false);
	const [filters, setFilters] = useState({
		season: "" as "W" | "S" | "",
		semester: [] as number[],
		level: [] as number[],
		activated: "" as "activated" | "not_activated" | "",
		mandatoryFor: [] as Programs[],
		electiveFor: [] as Programs[],
		professors: [] as string[],
		assistants: [] as string[],
		hasPrerequisites: false as boolean,
	});

	{
		/*
		filter checklist

		izbrisi btn da raboti

		reset filters da raboti
	*/
	}

	const filteredSubjects = subjectData.filter((subject) => {
		const searchMatches =
			subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			subject.abstract?.toLowerCase().includes(searchTerm.toLowerCase());

		const seasonMatches =
			filters.season === "" || filters.season === subject.info.season;

		const semesterMatches =
			filters.semester.length === 0 ||
			filters.semester.includes(subject.info.semester);

		const levelMatches =
			filters.level.length === 0 || filters.level.includes(subject.info.level);

		const activatedMatches =
			filters.activated == "" ||
			(filters.activated == "activated" && subject.info.activated) ||
			(filters.activated == "not_activated" && !subject.info.activated);

		const mandatoryMatches =
			filters.mandatoryFor.length === 0 ||
			subject.info.mandatory_for.some((item) =>
				filters.mandatoryFor.includes(item)
			);

		const electiveMatches =
			filters.electiveFor.length === 0 ||
			subject.info.elective_for.some((item) =>
				filters.electiveFor.includes(item)
			);

		const professorsMatches =
			professorSearchTerm == "" ||
			subject.info.professors.some((item) =>
				item.toLowerCase().includes(professorSearchTerm.toLowerCase())
			);

		const assistantsMatches =
			assistantSearchTerm == "" ||
			subject.info.assistants.some((item) =>
				item.toLowerCase().includes(assistantSearchTerm.toLowerCase())
			);

		const prerequisitesMatch =
			!filters.hasPrerequisites || subject.info.prerequisite == "";

		return (
			searchMatches &&
			seasonMatches &&
			semesterMatches &&
			levelMatches &&
			activatedMatches &&
			mandatoryMatches &&
			electiveMatches &&
			professorsMatches &&
			assistantsMatches &&
			prerequisitesMatch
		);
	});

	const FilterSidebar = () => {
		return (
			<div className="">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-semibold">Филтри</h2>
					<button
						onClick={() => console.log("reset filters; not implemented yet")}
						className="text-sm text-gray-600 hover:text-gray-900"
					>
						Избриши
					</button>
				</div>
				<div className="mb-4">
					{/* filter by season*/}
					<div className="space-y-1 mb-4">
						<h3 className="font-medium mb-2">Семестар</h3>
						<div className="grid grid-cols-2">
							{["Летен", "Зимски"].map((season) => {
								const seasonValue = season === "Летен" ? "S" : "W";
								return (
									<div key={season} className="flex items-center space-x-2">
										<input
											type="checkbox"
											name="season"
											id={seasonValue}
											onChange={() =>
												setFilters((prev) => ({
													...prev,
													season:
														prev.season === seasonValue ? "" : seasonValue,
												}))
											}
											checked={filters.season === seasonValue}
											className="h-4 w-4 rounded border-gray-300 text-blue-600"
										/>
										<label
											htmlFor={seasonValue}
											className="ml-2 text-sm text-gray-700"
										>
											{season}
										</label>
									</div>
								);
							})}
						</div>
					</div>

					{/* filter by semester*/}
					<div className="space-y-1 mb-4">
						{/* <h3 className="font-medium mb-2">Семестар</h3> */}
						<div className="grid grid-cols-4 gap-2">
							{Array.from(Array(8)).map((_, index) => {
								const i = index + 1;
								return (
									<div key={i} className="flex items-center space-x-2">
										<input
											type="checkbox"
											name="season"
											id={`s${i}`}
											onChange={() =>
												setFilters((prev) => ({
													...prev,
													semester: prev.semester.includes(i)
														? prev.semester.filter((item) => item !== i)
														: [...prev.semester, i],
												}))
											}
											checked={filters.semester.includes(i)}
											className="h-4 w-4 rounded border-gray-300 text-blue-600"
										/>
										<label htmlFor={`s${i}`} className="text-sm text-gray-700">
											{i}
										</label>
									</div>
								);
							})}
						</div>
					</div>
					{/* filter by level */}
					<div className="space-y-1 mb-4">
						<h3 className="font-medium mb-2">Ниво</h3>
						<div className="grid grid-cols-3">
							{Array.from(Array(3)).map((_, index) => {
								const i = index + 1;
								const level = `L${i}`;
								return (
									<div key={i} className="flex items-center space-x-2">
										<input
											type="checkbox"
											name="level"
											id={level}
											onChange={() =>
												setFilters((prev) => ({
													...prev,
													level: prev.level.includes(i)
														? prev.level.filter((item) => item !== i)
														: [...prev.level, i],
												}))
											}
											checked={filters.level.includes(i)}
											className="h-4 w-4 rounded border-gray-300 text-blue-600"
										/>
										<label
											htmlFor={`s${level}`}
											className="text-sm text-gray-700"
										>
											{level}
										</label>
									</div>
								);
							})}
						</div>
					</div>
					{/* filter by activation*/}
					<div className="space-y-1 mb-4">
						<h3 className="font-medium mb-2">Активирани</h3>
						<div className="grid grid-cols-2">
							{["Активирани", "Неактивирани"].map((value) => {
								const activeValue =
									value === "Активирани" ? "activated" : "not_activated";
								return (
									<div
										key={activeValue}
										className="flex items-center space-x-2"
									>
										<input
											type="checkbox"
											name="season"
											id={activeValue}
											onChange={() =>
												setFilters((prev) => ({
													...prev,
													activated:
														prev.activated === activeValue ? "" : activeValue,
												}))
											}
											checked={filters.activated === activeValue}
											className="h-4 w-4 rounded border-gray-300 text-blue-600"
										/>
										<label
											htmlFor={activeValue}
											className="ml-2 text-sm text-gray-700"
										>
											{value}
										</label>
									</div>
								);
							})}
						</div>
					</div>
					{/* filter by mandatoryFor */}
					<div className="space-y-1 mb-4">
						<h3 className="font-medium mb-2">Задолжителен за:</h3>
						<div className="grid grid-cols-3 gap-2">
							{PROGRAMS.map((program) => {
								const programName = program.replace(/\d+$/, "");
								return (
									<div key={program} className="flex items-center space-x-2">
										<input
											type="checkbox"
											name="level"
											id={program}
											onChange={() =>
												setFilters((prev) => ({
													...prev,
													mandatoryFor: prev.mandatoryFor.includes(program)
														? prev.mandatoryFor.filter(
																(item) => item !== program
														  )
														: [...prev.mandatoryFor, program],
												}))
											}
											checked={filters.mandatoryFor.includes(program)}
											className="h-4 w-4 rounded border-gray-300 text-blue-600"
										/>
										<label
											htmlFor={`s${program}`}
											className="text-sm text-gray-700"
										>
											{programName}
										</label>
									</div>
								);
							})}
						</div>
					</div>
					{/* filter by electiveFor */}
					<div className="space-y-1 mb-4">
						<h3 className="font-medium mb-2">Изборен за:</h3>
						<div className="grid grid-cols-3 gap-2">
							{PROGRAMS.map((program) => {
								const programName = program.replace(/\d+$/, "");
								return (
									<div key={program} className="flex items-center space-x-2">
										<input
											type="checkbox"
											name="level"
											id={program}
											onChange={() =>
												setFilters((prev) => ({
													...prev,
													electiveFor: prev.electiveFor.includes(program)
														? prev.electiveFor.filter(
																(item) => item !== program
														  )
														: [...prev.electiveFor, program],
												}))
											}
											checked={filters.electiveFor.includes(program)}
											className="h-4 w-4 rounded border-gray-300 text-blue-600"
										/>
										<label
											htmlFor={`s${program}`}
											className="text-sm text-gray-700"
										>
											{programName}
										</label>
									</div>
								);
							})}
						</div>
					</div>
					{/* filter by level */}
					<div className="space-y-1 mb-4">
						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								name="prereq"
								id="prereq"
								onChange={() =>
									setFilters((prev) => ({
										...prev,
										hasPrerequisites: !prev.hasPrerequisites,
									}))
								}
								checked={filters.hasPrerequisites}
								className="h-4 w-4 rounded border-gray-300 text-blue-600"
							/>
							<label htmlFor={"prereq"} className="text-sm text-gray-700">
								Предметот нема предуслови
							</label>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const SkeletonCard = () => {
		return (
			<div className="w-full px-4 py-8 border rounded-md shadow animate-pulse bg-white">
				<div className="h-4 w-3/4 bg-gray-300 rounded mb-2.5"></div>
				<div className="h-4 w-1/2 bg-gray-200 rounded mb-7"></div>

				<div className="h-4 w-full bg-gray-200 rounded mb-1"></div>
				<div className="h-4 w-5/6 bg-gray-200 rounded mb-3"></div>

				<div className="flex gap-2 mb-7">
					<div className="h-5 w-20 bg-gray-300 rounded-full"></div>
					<div className="h-5 w-24 bg-gray-300 rounded-full"></div>
					<div className="h-5 w-16 bg-gray-300 rounded-full"></div>
				</div>

				<div className="flex justify-between items-center">
					<div className="h-6 w-20 bg-gray-300 rounded-lg"></div>
					<div className="h-6 w-20 bg-gray-300 rounded-full"></div>
				</div>
			</div>
		);
	};

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch("http://localhost:8000/subjects");
			const data = await response.json();
			setSubjectData(data.subjects);
			setIsLoaded(true);
		};
		fetchData();
	}, []);

	useEffect(() => {
		if (subjectData.length == 0) return;
		const getRandomProfessor = () => {
			const randomSubject1 =
				subjectData[Math.floor(Math.random() * subjectData.length)];
			return randomSubject1?.info.professors[
				Math.floor(Math.random() * randomSubject1.info.professors.length)
			];
		};
		const getRandomAssistant = () => {
			const randomSubject2 =
				subjectData[Math.floor(Math.random() * subjectData.length)];
			return randomSubject2?.info.assistants[
				Math.floor(Math.random() * randomSubject2.info.assistants.length)
			];
		};
		let randomProfessor = "";
		let randomAssistant = "";

		while (!randomProfessor) randomProfessor = getRandomProfessor();
		while (!randomAssistant) randomAssistant = getRandomAssistant();

		setRandomStaff([randomProfessor, randomAssistant]);
	}, [subjectData]);

	const loadMore = () => {
		setVisibleCourses((prev) => prev + 10);
	};

	const openSubjectDetails = (subject: Subject) => {
		setSelectedSubject(subjectData[subject.id - 1]);
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
					<FilterSidebar />
					<div className="mb-6 relative">
						<h3 className="mb-2 font-medium">Пребарај по професор: </h3>
						<input
							type="text"
							placeholder={randomStaff[0]}
							value={professorSearchTerm}
							onChange={(e) => {
								return setProfessorSearchTerm(e.target.value);
							}}
							className="w-full py-3 px-2 border border-gray-300 rounded-lg
								focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
					<div className="mb-6 relative">
						<h3 className="mb-2 font-medium">Пребарај по асистент: </h3>
						<input
							type="text"
							placeholder={randomStaff[1]}
							value={assistantSearchTerm}
							onChange={(e) => {
								return setAssistantSearchTerm(e.target.value);
							}}
							className="w-full py-3 px-2 border border-gray-300 rounded-lg
								focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
				</div>
				{/* Main content */}
				<div className="flex-1">
					{/* Search bar */}
					<div className="mb-6 relative">
						<input
							type="text"
							placeholder="Пребарувај предмети по име, код, опис..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full p-3 pl-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
						<button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-4 py-1 rounded-lg">
							Search
						</button>
					</div>

					{/* Course grid */}

					{!isLoaded ? (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
							{[...Array(9)].map((_, index) => (
								<SkeletonCard key={index} />
							))}
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
							{filteredSubjects.slice(0, visibleCourses).map((subject) => (
								<div
									key={subject.id}
									className="border border-gray-200 rounded-lg overflow-hidden shadow-sm 
                                    hover:shadow-md transition-shadow duration-200"
								>
									<div className="p-4 min-h-full flex flex-col">
										<div className="flex justify-between items-start mb-2">
											<div>
												<h3 className="text-lg font-semibold">
													{subject.name}
												</h3>
												<p className="text-gray-600">{subject.code}</p>
											</div>
										</div>

										<p className="text-gray-700 text-sm mb-4 line-clamp-2">
											<strong>tuka treba abstract:</strong> Lorem ipsum dolor
											sit, amet consectetur adipisicing elit. Et praesentium
											dolores est animi officiis aperiam.
											{subject.abstract}
										</p>

										<div className="flex flex-wrap gap-2 mb-4">
											{/* these tags are for listing the domains a subject covers, ex. backend, AI ...*/}
											{[
												"Web Development",
												"Machine Learning",
												"Data Science",
											].map((tag) => (
												<span
													key={tag}
													className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
												>
													{tag}
												</span>
											))}
										</div>

										<div className="flex justify-between mt-auto">
											{/* these tags could be used as certain flags for some subjects, like most picked subject, best match etc. */}
											<div className="flex gap-3">
												<div className="bg-red-500 px-1 py-1 rounded-full text-sm font-medium">
													TAG1
												</div>
												<div className="bg-green-500 px-1 py-1 rounded-full text-sm font-medium">
													TAG2
												</div>
											</div>
											<button
												onClick={() => openSubjectDetails(subject)}
												className="flex items-center text-gray-700 hover:text-gray-900"
											>
												<img
													src="src/assets/eye.svg"
													className="w-4 h-4 mr-1"
												/>
												Погледни детали
											</button>
											{/* this could lead to a subject view page, for now there is no such thing*/}
											{/* if implemented, tags should be moved elsewhere*/}
											{/* <button
											onClick={() => openCourseDetails(course)}
											className="flex items-center text-blue-600 hover:text-blue-800"
										>
											Погледни детали
											<svg
												className="w-4 h-4 ml-1"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 5l7 7-7 7"
												/>
											</svg>
										</button> */}
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Load more button */}
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

					{/* No results message */}
					{isLoaded && filteredSubjects.length === 0 && (
						<div className="text-center py-12">
							<p className="text-gray-500 text-lg">
								Не постојат такви предмети
							</p>
							<button
								onClick={() =>
									console.log("reset filters; not implemented yet")
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
				/>
			)}
		</div>
	);
};

export default SubjectCatalog;
