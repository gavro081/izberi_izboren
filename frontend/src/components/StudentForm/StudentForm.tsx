import { useEffect, useState } from "react";
import {
	EVALUATIONS,
	EVALUATIONS_MAP,
	STUDY_EFFORT,
	STUDY_TRACKS,
	YEARS,
} from "../../constants/subjects";
import { useAuth } from "../../hooks/useAuth";
import { StudentData, StudyTrack, Subject } from "../types";
import FieldButton from "./FieldButton";
import SkeletonForm from "./SkeletonForm";
import SubjectsSelector from "./SubjectsSelector";
import {
	getPassedSubjectsByID,
	LatinToCyrillic,
	mapToID,
	validateForm,
} from "./utils";

interface StudentFormProps {
	formData: StudentData | null;
	isLoading: boolean;
	setIsLoading?: (b: boolean) => void;
}

interface DistinctSubjectData {
	tags: string[];
	professors: string[];
	technologies: string[];
}

const StudentForm = ({ formData, isLoading }: StudentFormProps) => {
	const { accessToken } = useAuth();
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [validationErrors, setValidationErrors] = useState<{
		[key: string]: string;
	}>({});
	const [index, setIndex] = useState(formData?.index || "");
	const [studyTrack, setStudyTrack] = useState<StudyTrack | "">(
		(formData?.study_track as StudyTrack) || ""
	);
	const [year, setYear] = useState(formData?.current_year || 1);
	const [passedSubjectsPerSemester, setPassedSubjectsPerSemester] = useState<
		Record<number, Subject[]>
	>(
		formData?.passed_subjects_per_semester ??
			Object.fromEntries(Array.from({ length: 8 }, (_, i) => [[i + 1], []]))
	);
	const [studyEffort, setStudyEffort] = useState(formData?.study_effort || "");
	const [domains, setDomains] = useState<string[]>(formData?.tags || []);
	const [semesterSearchTerms, setSemesterSearchTerms] = useState<
		Record<number, string>
	>({});
	const [professorsSearchTerm, setProfessorSearchTerm] = useState("");
	const [technologies, setTechnologies] = useState<string[]>(
		formData?.technologies || []
	);
	const [evaluation, setEvaluation] = useState(formData?.evaluation || []);
	const [favoriteProfs, setFavoriteProfs] = useState<string[]>(
		formData?.professors || []
	);
	const [isNemamSelected, setIsNemamSelected] = useState({
		domains: false,
		tech: false,
		eval: false,
		prof: false,
	});
	const [formStatus, setFormStatus] = useState<{
		isSubmitting: boolean;
		message: string;
		isError: boolean;
	}>({
		isSubmitting: false,
		message: "",
		isError: false,
	});
	const [showProfessors, setShowProfessors] = useState(false);
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [distinctSubjectData, setDistinctSubjectData] =
		useState<DistinctSubjectData>({
			tags: [],
			professors: [],
			technologies: [],
		});
	const [hasExtracurricular, setHasExtracurricular] = useState(false);
	const [invalidSubjects, setInvalidSubjects] = useState<Subject[]>([]);

	// Update form when formData changes (e.g., after fetching user data)
	useEffect(() => {
		if (formData) {
			setIndex(formData.index || "");
			setStudyTrack((formData.study_track as StudyTrack) || "");
			setYear(formData.current_year || 1);
			setStudyEffort(formData.study_effort || "");

			const domains_ = (formData.tags || []).includes("None")
				? []
				: formData.tags || [];
			setDomains(domains_);

			const technologies_ = (formData.technologies || []).includes("None")
				? []
				: formData.technologies || [];
			setTechnologies(technologies_);

			const eval_ = (formData.evaluation || []).map(
				(val: string) =>
					Object.keys(EVALUATIONS_MAP).find(
						(key) =>
							EVALUATIONS_MAP[key as keyof typeof EVALUATIONS_MAP] === val
					) || val
			);
			setEvaluation(
				eval_.includes("Немам") || eval_.includes("None") ? [] : eval_
			);

			const favoriteProfs_ = (formData.professors || []).includes("None")
				? []
				: formData.professors || [];
			setFavoriteProfs(favoriteProfs_);

			setPassedSubjectsPerSemester(formData.passed_subjects_per_semester || []);
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
				}
			} catch (error) {
				console.error("Error fetching subjects:", error);
			}
		};

		fetchSubjects();
	}, []);

	const toggleSubject = (subject: Subject, semester: number) => {
		const exists = (passedSubjectsPerSemester[semester] || []).some(
			(s) => s.id === subject.id
		);
		if (exists) {
			setPassedSubjectsPerSemester({
				...passedSubjectsPerSemester,
				[semester]: passedSubjectsPerSemester[semester].filter(
					(s) => s.id != subject.id
				),
			});
		} else {
			setPassedSubjectsPerSemester({
				...passedSubjectsPerSemester,
				[semester]: [...(passedSubjectsPerSemester[semester] || []), subject],
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const totalCredits = { value: -1 };
		const creditsByLevel = { value: [0, 0, 0] };
		const errors = validateForm({
			index,
			studyTrack,
			year,
			studyEffort,
			passedSubjectsPerSemester,
			hasExtracurricular,
			setInvalidSubjects,
			totalCredits,
			creditsByLevel,
		});
		if (Object.keys(errors).length > 0) {
			setValidationErrors(errors);
			window.scrollTo({ top: 0, behavior: "smooth" });
			if (errors.invalidSubjects)
				setFormStatus({
					isSubmitting: false,
					message: errors.invalidSubjects,
					isError: true,
				});
			else
				setFormStatus({
					isSubmitting: false,
					message: `Пополни ги сите задолжителни полиња`,
					isError: true,
				});
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
			passed_subjects: getPassedSubjectsByID(passedSubjectsPerSemester),
			study_effort: studyEffort,
			tags: domains,
			technologies: technologies,
			evaluation: evaluation.map(
				(ev) => EVALUATIONS_MAP[ev as keyof typeof EVALUATIONS_MAP] ?? ev
			),
			professors: favoriteProfs,
			passed_subjects_per_semester: mapToID(passedSubjectsPerSemester),
			has_extracurricular: hasExtracurricular,
			total_credits: totalCredits.value,
			level_credits: creditsByLevel.value,
		};
		try {
			// For updating existing form data use PATCH instead of PUT for partial updates
			const method = formData?.current_year || isSubmitted ? "PATCH" : "POST";
			const endpoint = "http://localhost:8000/auth/form/";
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
			window.scrollTo({ top: 0, behavior: "smooth" });
		} catch (error) {
			console.error("Form submission error:", error);

			setFormStatus({
				isSubmitting: false,
				message: `Грешка при зачувување: ${(error as Error).message}`,
				isError: true,
			});
			window.scrollTo({ top: 0, behavior: "smooth" });
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
		? subjects.filter((subj) =>
				subj.subject_info.elective_for.includes(studyTrack)
		  )
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
						onChange={(e) => {
							const newTrack = e.target.value as StudyTrack;
							const filteredPassedSubjectsPerSemester = Object.fromEntries(
								Object.entries(passedSubjectsPerSemester).map(
									([semester, subjects]) => {
										const filteredSubjects = subjects.filter(
											(subj) =>
												subj.subject_info.mandatory_for.includes(newTrack) ||
												subj.subject_info.elective_for.includes(newTrack)
										);
										return [
											semester,
											filteredSubjects.length > 0 ? filteredSubjects : [],
										];
									}
								)
							);
							setPassedSubjectsPerSemester(filteredPassedSubjectsPerSemester);
							setStudyTrack(newTrack);
						}}
						className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 custom-select"
					>
						<option value="">Избери смер</option>
						{STUDY_TRACKS.map((track) => (
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
				<h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
					Година на студии
					<span
						className="relative group cursor-pointer"
						tabIndex={0}
						aria-label="Објаснување за година на студии"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="18"
							height="18"
							fill="currentColor"
							viewBox="0 0 20 20"
							className="text-gray-400"
						>
							<circle
								cx="10"
								cy="10"
								r="9"
								stroke="currentColor"
								strokeWidth="2"
								fill="none"
							/>
							<text
								x="10"
								y="15"
								textAnchor="middle"
								fontSize="13"
								fill="currentColor"
							>
								?
							</text>
						</svg>
						<span className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-gray-800 text-white text-xs rounded px-3 py-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity z-10">
							Ако моментално е јуни/јули/август/септември, за да добиеш
							соодветни препораки избери дека си твојата година + 1. Пример ако
							си 2 година и е јуни, избери дека си 3 година.
						</span>
					</span>
				</h3>
				<select
					value={year}
					onChange={(e) => setYear(Number(e.target.value))}
					className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 custom-select"
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
			<SubjectsSelector
				studyTrack={studyTrack}
				year={year}
				filteredMandatorySubjects={filteredMandatorySubjects}
				filteredElectiveSubjects={filteredElectiveSubjects}
				toggleSubject={toggleSubject}
				semesterSearchTerms={semesterSearchTerms}
				setSemesterSearchTerms={setSemesterSearchTerms}
				validationErrors={validationErrors}
				passedSubjectsPerSemester={passedSubjectsPerSemester}
				invalidSubjects={invalidSubjects}
			/>
			<div>
				<label className="flex items-center gap-2 text-lg font-medium text-gray-900 mb-2">
					<input
						type="checkbox"
						checked={hasExtracurricular}
						onChange={() => setHasExtracurricular(!hasExtracurricular)}
						className="form-checkbox h-4 w-5 mr-2 accent-green-600"
					/>
					Имам завршено HPC курсеви, или некои други екстракурикуларни
					активности кои носат вкупно 6 кредити.
				</label>
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
								type="radio"
								checked={studyEffort == effort}
								onChange={() =>
									setStudyEffort(studyEffort == effort ? "" : effort)
								}
								className="h-4 w-5 mr-2 accent-green-600"
							/>
							<span>{effort}</span>
						</label>
					))}
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
					{["Немам", ...distinctSubjectData.tags].map((item) => {
						const isSelected =
							domains.includes(item) ||
							(item === "Немам" && isNemamSelected["domains"]);
						const shouldBeDisabled =
							isNemamSelected["domains"] && item !== "Немам";
						return (
							<FieldButton
								key={item}
								keyProp={item}
								state={domains}
								stateSetter={setDomains}
								field="domains"
								isSelected={isSelected}
								isDisabled={shouldBeDisabled}
								setIsNemamSelected={setIsNemamSelected}
							/>
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
					{["Немам", ...distinctSubjectData.technologies].map((item) => {
						const isSelected =
							technologies.includes(item) ||
							(item === "Немам" && isNemamSelected["tech"]);
						const shouldBeDisabled =
							isNemamSelected["tech"] && item !== "Немам";
						return (
							<FieldButton
								key={item}
								keyProp={item}
								state={technologies}
								stateSetter={setTechnologies}
								field="tech"
								isSelected={isSelected}
								isDisabled={shouldBeDisabled}
								setIsNemamSelected={setIsNemamSelected}
							/>
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
					{["Немам", ...EVALUATIONS].map((item) => {
						const isSelected =
							evaluation.includes(item) ||
							(item === "Немам" && isNemamSelected["eval"]);
						const shouldBeDisabled =
							isNemamSelected["eval"] && item !== "Немам";
						return (
							<FieldButton
								key={item}
								keyProp={item}
								state={evaluation}
								stateSetter={setEvaluation}
								field="eval"
								isSelected={isSelected}
								isDisabled={shouldBeDisabled}
								setIsNemamSelected={setIsNemamSelected}
							/>
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
					{
						<input
							onChange={(e) => setProfessorSearchTerm(e.target.value)}
							value={professorsSearchTerm}
							disabled={isNemamSelected["prof"]}
							type="text"
							className="w-60 px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
							placeholder="Пребарај професор"
						/>
					}
				</div>
				<div className="flex flex-wrap gap-2">
					{["Немам", ...filteredProfessors]
						.slice(0, showProfessors ? undefined : 10)
						.map((item) => {
							// hides "Nemam" when searching
							if (item == "Немам" && professorsSearchTerm !== "") return;
							const isSelected =
								favoriteProfs.includes(item) ||
								(item === "Немам" && isNemamSelected["prof"]);
							const shouldBeDisabled =
								isNemamSelected["prof"] && item !== "Немам";
							return (
								<FieldButton
									key={item}
									keyProp={item}
									state={favoriteProfs}
									stateSetter={setFavoriteProfs}
									field="prof"
									isSelected={isSelected}
									isDisabled={shouldBeDisabled}
									setIsNemamSelected={setIsNemamSelected}
								/>
							);
						})}
					{filteredProfessors.length == 0 && (
						<p className="text-gray-500 italic">Нема таков професор</p>
					)}
					{filteredProfessors.length > 10 && (
						<button
							type="button"
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
