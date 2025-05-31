import { useEffect, useState } from "react";
import {
	EVALUATIONS,
	EVALUATIONS_MAP,
	PROGRAMS,
	STUDY_EFFORT,
	YEARS,
} from "../../constants/subjects";
import { useAuth } from "../../hooks/useAuth";
import { Programs, StudentData, Subject } from "../types";
import SkeletonForm from "./SkeletonForm";
import { LatinToCyrillic } from "./utils";

interface StudentFormProps {
	formData: StudentData | null;
}

interface DistinctSubjectData {
	tags: string[];
	professors: string[];
	technologies: string[];
}

const StudentForm = ({ formData }: StudentFormProps) => {
	const { accessToken } = useAuth();
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [validationErrors, setValidationErrors] = useState<{
		[key: string]: string;
	}>({});
	const [index, setIndex] = useState(formData?.index || "");
	const [studyTrack, setStudyTrack] = useState<Programs | "">(
		(formData?.study_track as Programs) || ""
	);
	const [year, setYear] = useState(formData?.current_year || 1);
	const [passedSubjects, setPassedSubjects] = useState<Subject[]>(
		formData?.passed_subjects || []
	);
	const [studyEffort, setStudyEffort] = useState(formData?.study_effort || "");
	const [domains, setDomains] = useState<string[]>(
		formData?.preferred_domains || []
	);
	const [electiveSearchTerm, setElectiveSearchTerm] = useState("");
	const [professorsSearchTerm, setProfessorSearchTerm] = useState("");
	const [technologies, setTechnologies] = useState<string[]>(
		formData?.preferred_technologies || []
	);
	const [evaluation, setEvaluation] = useState(
		formData?.preferred_evaluation || []
	);
	const [favoriteProfs, setFavoriteProfs] = useState<string[]>(
		formData?.favorite_professors || []
	);
	const [formStatus, setFormStatus] = useState<{
		isSubmitting: boolean;
		message: string;
		isError: boolean;
	}>({
		isSubmitting: false,
		message: "",
		isError: false,
	});
	const [showElective, setShowElective] = useState(false);
	const [showProfessors, setShowProfessors] = useState(false);
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [distinctSubjectData, setDistinctSubjectData] =
		useState<DistinctSubjectData>({
			tags: [],
			professors: [],
			technologies: [],
		});
	const [isLoading, setIsLoading] = useState(true);

	// Update form when formData changes (e.g., after fetching user data)
	useEffect(() => {
		if (formData) {
			setIndex(formData.index || "");
			setStudyTrack((formData.study_track as Programs) || "");
			setYear(formData.current_year || 1);
			setPassedSubjects(formData.passed_subjects || []);
			setStudyEffort(formData.study_effort || "");
			setDomains(formData.preferred_domains || []);
			setTechnologies(formData.preferred_technologies || []);
			setEvaluation(formData.preferred_evaluation || []);
			setFavoriteProfs(formData.favorite_professors || []);
		}
	}, [formData]);

	useEffect(() => {
		const fetchSubjects = async () => {
			try {
				const resSubjects = await fetch("http://localhost:8000/subjects");
				if (resSubjects.ok) {
					const subJson: Subject[] = await resSubjects.json();
					setSubjects(subJson || []);
					const allProfessors: string[] = subJson
						.flatMap((subject: Subject) => subject.subject_info.professors)
						.filter((p): p is string => typeof p === "string");
					const uniqueProfessors = Array.from(new Set(allProfessors));
					const allProfessors_ = uniqueProfessors
						.filter((prof) => prof.trim().toLowerCase() !== "сите професори")
						.sort((a, b) => a.localeCompare(b));
					setDistinctSubjectData(() => ({
						tags: Array.from(
							new Set(subJson.flatMap((subject) => subject.subject_info.tags))
						).sort((a, b) => a.localeCompare(b)),
						technologies: Array.from(
							new Set(
								subJson
									.flatMap((subject) => subject.subject_info.technologies)
									.filter((tech) => tech != "any" && tech != "")
							)
						).sort((a, b) => a.localeCompare(b)),
						professors: allProfessors_,
					}));
					// todo: no explanation needed
					setTimeout(() => setIsLoading(false), 900);
				}
			} catch (error) {
				console.error("Error fetching subjects:", error);
				setIsLoading(false);
			}
		};

		fetchSubjects();
	}, []);

	const validateForm = () => {
		const errors: { [key: string]: string } = {};

		if (!index.trim()) {
			errors.index = "Индексот e задолжителен.";
		} else if (!/^\d{6}$/.test(index)) {
			errors.index = "Индексот треба да има точно 6 цифри.";
		}
		if (!studyTrack) errors.studyTrack = "Одбери насока.";
		if (!year) errors.year = "Одбери година.";
		if (!studyEffort) errors.studyEffort = "Одбери пожелен вложен труд.";
		if (passedSubjects.length === 0)
			errors.passedSubjects = "Одбери барем еден предмет.";
		if (domains.length === 0) errors.domains = "Одбери барем едно поле.";
		if (technologies.length === 0)
			errors.technologies = "Одбери барем една технологија.";
		if (!evaluation) errors.evaluation = "Одбери тип на оценување.";
		return errors;
	};

	const toggleSelection = (
		value: string | number,
		setter: React.Dispatch<React.SetStateAction<any[]>>,
		current: any[]
	) => {
		if (current.includes(value)) {
			setter(current.filter((v) => v !== value));
		} else {
			setter([...current, value]);
		}
	};

	const toggleSubject = (subject: Subject) => {
		const exists = passedSubjects.some((s) => s.id === subject.id);
		if (exists) {
			setPassedSubjects(passedSubjects.filter((s) => s.id !== subject.id));
		} else {
			setPassedSubjects([...passedSubjects, subject]);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const errors = validateForm();
		if (Object.keys(errors).length > 0) {
			setValidationErrors(errors);
			return;
		}
		setValidationErrors({});
		setFormStatus({
			isSubmitting: true,
			message: "",
			isError: false,
		});

		const payload = {
			index,
			study_track: studyTrack,
			current_year: year,
			passed_subjects: passedSubjects.map((subject) => subject.id),
			study_effort: studyEffort,
			preferred_domains: domains,
			preferred_technologies: technologies,
			preferred_evaluation: evaluation.map(
				(ev) => EVALUATIONS_MAP[ev as keyof typeof EVALUATIONS_MAP]
			),
			favorite_professors: favoriteProfs,
		};
		try {
			// For updating existing form data use PATCH instead of PUT for partial updates
			const method = formData?.current_year ? "PATCH" : "POST";
			const endpoint = "http://localhost:8000/auth/form/";
			console.log(payload);
			const res = await fetch(endpoint, {
				method,
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				setFormStatus({
					isSubmitting: false,
					message: "Формата е успешно зачувана!",
					isError: false,
				});

				setTimeout(() => {
					setFormStatus((prev) => ({ ...prev, message: "" }));
				}, 5000);
			} else {
				const errorData = await res.json();
				throw new Error(errorData.message || "Error submitting form");
			}
			setIsSubmitted(true);
		} catch (error) {
			console.error("Form submission error:", error);
			setFormStatus({
				isSubmitting: false,
				message: `Грешка при зачувување: ${(error as Error).message}`,
				isError: true,
			});
		}
	};

	const filteredMandatorySubjects = studyTrack
		? subjects
				.filter(
					(subj) =>
						subj.subject_info.mandatory_for.includes(studyTrack) &&
						subj.subject_info.semester <= year * 2
				)
				.sort((a, b) => a.subject_info.semester - b.subject_info.semester)
		: [];
	const filteredElectiveSubjects = studyTrack
		? subjects
				.filter(
					(subj) =>
						subj.subject_info.elective_for.includes(studyTrack) &&
						(electiveSearchTerm == "" ||
							subj.name
								.toLowerCase()
								.includes(LatinToCyrillic(electiveSearchTerm).toLowerCase()))
					// subj.subject_info.semester <= year * 2
				)
				.sort((a, b) => a.subject_info.semester - b.subject_info.semester)
		: [];

	const filteredProfessors = distinctSubjectData.professors.filter(
		(prof) =>
			professorsSearchTerm == "" ||
			prof
				.toLowerCase()
				.includes(LatinToCyrillic(professorsSearchTerm).toLowerCase())
	);

	if (isLoading) {
		return <SkeletonForm />;
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
			<h2 className="text-2xl font-bold mb-4 text-center">
				{isSubmitted || formData?.current_year
					? "Ажурирај ги податоците"
					: "Внеси податоци"}
			</h2>

			{formStatus.message && (
				<div
					className={`px-4 py-3 rounded mb-4 font-bold ${
						formStatus.isError
							? "bg-red-100 border border-red-400 text-red-700"
							: "bg-green-100 border border-green-400 text-green-700"
					}`}
				>
					{formStatus.message}
				</div>
			)}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<h3 className="text-lg font-medium text-gray-900 mb-2">Индекс</h3>
					<input
						type="text"
						placeholder="Внеси индекс"
						value={index}
						onChange={(e) => setIndex(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
					/>
					{validationErrors.index && (
						<p className="mt-1 text-sm text-red-600 font-bold">
							{validationErrors.index}
						</p>
					)}
				</div>

				<div>
					<h3 className="text-lg font-medium text-gray-900 mb-2">Смер</h3>
					<select
						value={studyTrack}
						onChange={(e) => setStudyTrack(e.target.value as Programs | "")}
						className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
					>
						<option value="">Одбери смер</option>
						{PROGRAMS.map((track) => (
							<option key={track} value={track}>
								{track}
							</option>
						))}
					</select>
					{validationErrors.studyTrack && (
						<p className="mt-1 text-sm text-red-600 font-bold">
							{validationErrors.studyTrack}
						</p>
					)}
				</div>
			</div>

			<div>
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					Година на студии
				</h3>
				<select
					value={year}
					onChange={(e) => setYear(Number(e.target.value))}
					className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
				>
					{YEARS.map((y) => (
						<option key={y} value={y}>
							{y}. година
						</option>
					))}
				</select>
				{validationErrors.year && (
					<p className="mt-1 text-sm text-red-600 font-bold">
						{validationErrors.year}
					</p>
				)}
			</div>

			<div>
				{/* <div className="flex gap-5 items-center mb-2"> */}
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					Положени задолжителни предмети
				</h3>
				{studyTrack != "" && (
					<div className="flex items-center mb-2">
						<label className="inline-flex items-center p-1 rounded">
							<input
								type="checkbox"
								className="form-checkbox h-5 w-5 accent-green-600"
								disabled={filteredMandatorySubjects.length === 0}
								checked={filteredMandatorySubjects.every((subject) =>
									passedSubjects.some((passed) => passed.id === subject.id)
								)}
								onChange={() => {
									const allSelected = filteredMandatorySubjects.every(
										(subject) =>
											passedSubjects.some((passed) => passed.id === subject.id)
									);

									if (allSelected) {
										setPassedSubjects((prev) =>
											prev.filter(
												(subject) =>
													!filteredMandatorySubjects.some(
														(mandatorySubj) => mandatorySubj.id === subject.id
													)
											)
										);
									} else {
										setPassedSubjects((prev) => {
											const newSubjects = filteredMandatorySubjects.filter(
												(subject) =>
													!prev.some((passed) => passed.id === subject.id)
											);
											return [...prev, ...newSubjects];
										});
									}
								}}
							/>
							<span className="ml-2 text-md text-gray-700">Одбери ги сите</span>
						</label>
					</div>
				)}
				{filteredMandatorySubjects.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						{filteredMandatorySubjects.map((subject) => {
							const isSelected = passedSubjects.some(
								(s) => s.id === subject.id
							);
							return (
								<button
									type="button"
									key={subject.id}
									onClick={() => toggleSubject(subject)}
									className={`flex items-center gap-2 px-3 py-2 border rounded-md transition-all duration-200 
                    ${
											isSelected
												? "bg-green-500 border-green-600 text-green-50"
												: "bg-white hover:bg-gray-50 border-gray-300"
										}`}
									aria-pressed={isSelected}
								>
									{isSelected && (
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
									)}
									<span>{subject.name}</span>
								</button>
							);
						})}
					</div>
				) : (
					<p className="text-gray-500 italic">
						{!studyTrack
							? "Одбери смер и година за да се прикажат предметите."
							: "Нема такви задолжителни предмети"}
					</p>
				)}
				{validationErrors.passedSubjects && (
					<p className="mt-1 text-sm text-red-600 font-bold">
						{validationErrors.passedSubjects}
					</p>
				)}
			</div>
			<div>
				<div className="flex items-center mb-2 gap-7">
					<h3 className="text-lg font-medium text-gray-900">
						Положени изборни предмети
					</h3>
					{studyTrack != "" && (
						<input
							onChange={(e) => setElectiveSearchTerm(e.target.value)}
							value={electiveSearchTerm}
							type="text"
							className="w-60 px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
							placeholder="Пребарај предмет"
						/>
					)}
				</div>
				{filteredElectiveSubjects.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						{filteredElectiveSubjects
							.slice(0, showElective ? undefined : 10)
							.map((subject) => {
								const isSelected = passedSubjects.some(
									(s) => s.id === subject.id
								);
								return (
									<button
										type="button"
										key={subject.id}
										onClick={() => toggleSubject(subject)}
										className={`flex items-center gap-2 px-3 py-2 border rounded-md transition-all duration-200 
                    					${
																isSelected
																	? "bg-green-500 text-white border-green-600 shadow-md"
																	: "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
															}`}
										aria-pressed={isSelected}
									>
										{isSelected && (
											<svg
												className="w-5 h-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M5 13l4 4L19 7"
												></path>
											</svg>
										)}
										<span>{subject.name}</span>
									</button>
								);
							})}
						{filteredElectiveSubjects.length > 10 && (
							<button
								onClick={() => setShowElective(!showElective)}
								className="px-3 py-2 rounded-md transition-colors duration-200 bg-blue text-blue-500"
							>
								{showElective ? "Прикажи помалку" : "Прикажи повеќе"}
							</button>
						)}
					</div>
				) : (
					<p className="text-gray-500 italic">
						{!studyTrack
							? "Одбери смер и година за да се прикажат предметите"
							: "Нема такви изборни предмети"}
					</p>
				)}
			</div>

			<div>
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					Вложен труд при учење
				</h3>
				<div className="flex flex-wrap gap-3">
					{STUDY_EFFORT.map((effort) => (
						<label
							key={effort}
							className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors ${
								studyEffort == effort && "font-bold"
							}`}
						>
							<input
								type="checkbox"
								checked={studyEffort == effort}
								onChange={() =>
									setStudyEffort(studyEffort == effort ? "" : effort)
								}
								className="form-checkbox h-4 w-5 mr-2 accent-green-600"
							/>
							<span>{effort}</span>
						</label>
					))}
					{/* tuka */}
					{/* <div className="w-full mt-4 flex flex-col items-center">
						<input
							type="range"
							min={1}
							max={5}
							step={1}
							value={studyEffort || 1}
							onChange={(e) => setStudyEffort(Number(e.target.value))}
							className="w-64 accent-blue-600"
						/>
						<div className="flex justify-between w-64 text-xs mt-1 text-gray-500">
							{STUDY_EFFORT.map((effort) => (
								<span key={effort}>{effort}</span>
							))}
						</div>
					</div> */}
				</div>
				{validationErrors.studyEffort && (
					<p className="mt-1 text-sm text-red-600 font-bold">
						{validationErrors.studyEffort}
					</p>
				)}
			</div>

			<div>
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					Полиња на интерес
				</h3>
				<div className="flex flex-wrap gap-2">
					{distinctSubjectData.tags.map((domain) => {
						const isSelected = domains.includes(domain);
						const isNemamSelected = domains.includes("Немам");
						const shouldBeDisabled = isNemamSelected && domain !== "Немам";
						return (
							<button
								type="button"
								key={domain}
								onClick={() => {
									if (domain === "Немам") {
										if (domains.includes("Немам")) {
											setDomains([]);
										} else {
											setDomains(["Немам"]);
										}
									} else {
										const newDomains = domains.filter((t) => t !== "Немам");
										toggleSelection(domain, setDomains, newDomains);
									}
								}}
								disabled={shouldBeDisabled}
								className={`px-3 py-2 border rounded-md transition-colors ${
									isSelected
										? "bg-green-100 border-green-300 text-green-800"
										: "bg-white hover:bg-gray-50 border-gray-300"
								} ${shouldBeDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
							>
								{domain}
							</button>
						);
					})}
				</div>
				{validationErrors.domains && (
					<p className="mt-1 text-sm text-red-600 font-bold">
						{validationErrors.domains}
					</p>
				)}
			</div>

			<div>
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					Преферирани технологии
				</h3>
				<div className="flex flex-wrap gap-2">
					{distinctSubjectData.technologies.map((tech) => {
						const isSelected = technologies.includes(tech);
						const isNemamSelected = technologies.includes("Немам");
						const shouldBeDisabled = isNemamSelected && tech !== "Немам";
						return (
							<button
								type="button"
								key={tech}
								onClick={() => {
									if (tech === "Немам") {
										if (technologies.includes("Немам")) {
											setTechnologies([]);
										} else {
											setTechnologies(["Немам"]);
										}
									} else {
										const newTechs = technologies.filter((t) => t !== "Немам");
										toggleSelection(tech, setTechnologies, newTechs);
									}
								}}
								disabled={shouldBeDisabled}
								className={`px-3 py-2 border rounded-md transition-colors ${
									isSelected
										? "bg-yellow-100 border-yellow-300 text-yellow-800"
										: "bg-white hover:bg-gray-50 border-gray-300"
								} ${shouldBeDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
							>
								{tech}
							</button>
						);
					})}
				</div>
				{validationErrors.technologies && (
					<p className="mt-1 text-sm text-red-600 font-bold">
						{validationErrors.technologies}
					</p>
				)}
			</div>

			<div>
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					Преферирани начин на оценување
				</h3>
				<div className="flex flex-wrap gap-2">
					{EVALUATIONS.map((ev) => {
						const isSelected = evaluation.includes(ev);
						const isNemamSelected = evaluation.includes("Немам");
						const shouldBeDisabled = isNemamSelected && ev !== "Немам";
						return (
							<button
								type="button"
								key={ev}
								onClick={() => {
									// todo: sredi ova
									if (ev === "Немам") {
										if (evaluation.includes("Немам")) {
											setEvaluation([]);
										} else {
											setEvaluation(["Немам"]);
										}
									} else {
										const newEvaluation = evaluation.filter(
											(t) => t !== "Немам"
										);
										toggleSelection(ev, setEvaluation, newEvaluation);
									}
								}}
								disabled={shouldBeDisabled}
								className={`px-3 py-2 border rounded-md transition-colors ${
									isSelected
										? "bg-green-100 border-green-300 text-green-800"
										: "bg-white hover:bg-gray-50 border-gray-300"
								} ${shouldBeDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
							>
								{ev}
							</button>
						);
					})}
				</div>
				{validationErrors.evaluation && (
					<p className="mt-1 text-sm text-red-600 font-bold">
						{validationErrors.evaluation}
					</p>
				)}
			</div>

			<div>
				<div className="flex items-center mb-2 gap-7">
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						Омилени професори
					</h3>
					{studyTrack != "" && (
						<input
							onChange={(e) => setProfessorSearchTerm(e.target.value)}
							value={professorsSearchTerm}
							type="text"
							className="w-60 px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
							placeholder="Пребарај професор"
						/>
					)}
				</div>
				<div className="flex flex-wrap gap-2">
					{filteredProfessors
						.slice(0, showProfessors ? undefined : 10)
						.map((prof) => (
							<button
								key={prof}
								type="button"
								onClick={() =>
									toggleSelection(prof, setFavoriteProfs, favoriteProfs)
								}
								className={`px-3 py-2 border rounded-md transition-colors ${
									favoriteProfs.includes(prof)
										? "bg-pink-100 border-pink-300 text-pink-800"
										: "bg-white hover:bg-gray-50 border-gray-300"
								}`}
							>
								{prof}
							</button>
						))}
					{filteredProfessors.length == 0 && (
						<p className="text-gray-500 italic">Нема таков професор</p>
					)}
					{filteredProfessors.length > 10 && (
						<button
							onClick={() => setShowProfessors(!showProfessors)}
							className="px-3 py-2 rounded-md transition-colors duration-200 bg-blue text-blue-500"
						>
							{showProfessors ? "Прикажи помалку" : "Прикажи повеќе"}
						</button>
					)}
				</div>
			</div>

			<div className="pt-4">
				<button
					type="submit"
					disabled={formStatus.isSubmitting}
					className={`w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
						formStatus.isSubmitting ? "opacity-70 cursor-not-allowed" : ""
					}`}
				>
					{formStatus.isSubmitting
						? "Се зачувува..."
						: formData?.current_year
						? "Ажурирај"
						: "Зачувај"}
				</button>
			</div>
		</form>
	);
};

export default StudentForm;
