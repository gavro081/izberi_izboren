import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
	EVALUATIONS,
	EVALUATIONS_MAP,
	PROGRAMS,
	STUDY_EFFORT,
	YEARS,
} from "../../constants/subjects";
import { useAuth } from "../../hooks/useAuth";
import { Programs, StudentData, Subject, SubjectID } from "../types";
import SkeletonForm from "./SkeletonForm";
import SubjectsSelector from "./SubjectsSelector";
import { LatinToCyrillic } from "./utils";

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
	const [studyTrack, setStudyTrack] = useState<Programs | "">(
		(formData?.study_track as Programs) || ""
	);
	const [year, setYear] = useState(formData?.current_year || 1);
	const [passedSubjects, setPassedSubjects] = useState<Subject[]>(
		formData?.passed_subjects || []
	);
	const [passedSubjectsPerSemester, setPassedSubjectsPerSemester] = useState<
		Record<number, SubjectID[]>
	>(
		formData?.passed_subjects_per_semester ??
			Object.fromEntries(
				Array.from({ length: 8 }, (_, i) => [i + 1, [] as SubjectID[]])
			)
	);
	const [studyEffort, setStudyEffort] = useState(formData?.study_effort || "");
	const [domains, setDomains] = useState<string[]>(
		formData?.preferred_domains || []
	);
	const [semesterSearchTerms, setSemesterSearchTerms] = useState<
		Record<number, string>
	>({});
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
			setPassedSubjectsPerSemester(
				formData.passed_subjects_per_semester ||
					Object.fromEntries(Array.from({ length: 8 }, (_, i) => [i + 1, []]))
			);
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
					// setIsLoading(false);
				}
			} catch (error) {
				console.error("Error fetching subjects:", error);
				// setIsLoading(false);
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
		// if (domains.length === 0) errors.domains = "Одбери барем едно поле.";
		// if (technologies.length === 0)
		// 	errors.technologies = "Одбери барем една технологија.";
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

	// const toggleSubject = (subject: Subject) => {
	// 	const exists = passedSubjects.some((s) => s.id === subject.id);
	// 	if (exists) {
	// 		setPassedSubjects(passedSubjects.filter((s) => s.id !== subject.id));
	// 	} else {
	// 		setPassedSubjects([...passedSubjects, subject]);
	// 	}
	// };

	const toggleSubjectByID = (id: SubjectID, semester: number) => {
		const exists_table1 = passedSubjects.some((s) => s.id === id);
		const exists_table2 = passedSubjectsPerSemester[semester]?.includes(id);
		if (exists_table1 !== exists_table2) {
			alert("ABSDSAADSKNDSAKNASADSNADSKNDASKADSN");
			throw Error;
		}
		if (exists_table1) {
			setPassedSubjects(passedSubjects.filter((s) => s.id !== id));
			setPassedSubjectsPerSemester({
				...passedSubjectsPerSemester,
				[semester]: passedSubjectsPerSemester[semester].filter(
					(id_: SubjectID) => id_ != id
				),
			});
		} else {
			const subject = subjects.find((s) => s.id == id);
			if (subject) {
				setPassedSubjects([...passedSubjects, subject]);
				setPassedSubjectsPerSemester({
					...passedSubjectsPerSemester,
					[semester]: [...(passedSubjectsPerSemester[semester] || []), id],
				});
			}
		}
	};
	const getLevelCredits = () => {
		return passedSubjects.reduce(
			(acc, subject) => {
				if (
					studyTrack &&
					!subject.subject_info.mandatory_for.includes(studyTrack)
				) {
					const level = subject.subject_info.level;
					acc[level - 1] += 6;
				}
				return acc;
			},
			[0, 0, 0]
		);
	};

	const getCredits = () => {
		const credits = (passedSubjects.length + Number(hasExtracurricular)) * 6;
		return passedSubjects.some((s) => s.name == "Професионални вештини") &&
			passedSubjects.some((s) => s.name == "Спорт и здравје")
			? credits - 6
			: credits;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const errors = validateForm();
		if (Object.keys(errors).length > 0) {
			setValidationErrors(errors);
			window.scrollTo({ top: 0, behavior: "smooth" });
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
			passed_subjects: passedSubjects.map((subject) => subject.id),
			study_effort: studyEffort,
			preferred_domains: domains,
			preferred_technologies: technologies,
			preferred_evaluation: evaluation.map(
				(ev) => EVALUATIONS_MAP[ev as keyof typeof EVALUATIONS_MAP]
			),
			favorite_professors: favoriteProfs,
			passed_subjects_per_semester: passedSubjectsPerSemester,
			total_credits: getCredits(),
			level_credits: getLevelCredits(),
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

	const FieldButton: React.FC<{
		keyProp: string | number;
		state: string[];
		stateSetter: Dispatch<SetStateAction<any[]>>;
		field: "prof" | "tech" | "eval" | "domains";
		isSelected: boolean;
		isDisabled: boolean;
	}> = ({ keyProp, state, stateSetter, field, isSelected, isDisabled }) => {
		const handleClick = () => {
			if (keyProp === "Немам") {
				if (state.includes("None")) {
					stateSetter([]);
				} else {
					stateSetter(["None"]);
				}
				setIsNemamSelected((prev) => ({
					...prev,
					[field]: !prev[field],
				}));
			} else {
				const new_ = state.filter((t) => t !== "Немам");
				toggleSelection(keyProp, stateSetter, new_);
			}
		};

		return (
			<button
				type="button"
				key={keyProp}
				onClick={handleClick}
				disabled={isDisabled}
				className={`px-3 py-2 border rounded-md transition-colors ${
					isSelected
						? "bg-yellow-100 border-yellow-300 text-yellow-800"
						: "bg-white hover:bg-gray-50 border-gray-300"
				} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
			>
				{keyProp}
			</button>
		);
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
		? subjects.filter(
				(subj) => subj.subject_info.elective_for.includes(studyTrack)
				// subj.subject_info.semester <= year * 2
		  )
		: // .sort((a, b) => a.subject_info.semester - b.subject_info.semester)
		  [];

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
						className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 custom-select"
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
				passedSubjects={passedSubjects}
				// toggleSubject={toggleSubject}
				toggleSubjectByID={toggleSubjectByID}
				semesterSearchTerms={semesterSearchTerms}
				setSemesterSearchTerms={setSemesterSearchTerms}
				validationErrors={validationErrors}
				passedSubjectsPerSemester={passedSubjectsPerSemester}
				setPassedSubjectsPerSemester={setPassedSubjectsPerSemester}
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
