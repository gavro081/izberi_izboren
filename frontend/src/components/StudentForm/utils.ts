import { Dispatch, SetStateAction } from "react";
import { L1_LIMIT, L2_LIMIT } from "../../constants/subjects";
import { StudyTrack, Subject, SubjectID } from "../types";

// NOTE: there is not a single match for the letter 'ѕ' (ѕ како ѕвонче) in the entire db, so both dz and dj are mapped to 'џ'
// this way you can search for "Menadzment", instead of having to write "Menadjment"
// if there is ever a term anywhere in the db that contains the letter 'ѕ' by design that term will be unsearchable :)

const latinToCyrillicMap: [RegExp, string][] = [
	[/(sh)/gi, "ш"],
	[/(ch)/gi, "ч"],
	[/(zh)/gi, "ж"],
	[/(gj)/gi, "ѓ"],
	[/(kj)/gi, "ќ"],
	[/(lj)/gi, "љ"],
	[/(nj)/gi, "њ"],
	[/(dj)/gi, "џ"],
	[/(dz)/gi, "џ"],
	[/(a)/gi, "а"],
	[/(b)/gi, "б"],
	[/(v)/gi, "в"],
	[/(g)/gi, "г"],
	[/(d)/gi, "д"],
	[/(e)/gi, "е"],
	[/(z)/gi, "з"],
	[/(i)/gi, "и"],
	[/(j)/gi, "ј"],
	[/(k)/gi, "к"],
	[/(l)/gi, "л"],
	[/(m)/gi, "м"],
	[/(n)/gi, "н"],
	[/(o)/gi, "о"],
	[/(p)/gi, "п"],
	[/(r)/gi, "р"],
	[/(s)/gi, "с"],
	[/(t)/gi, "т"],
	[/(u)/gi, "у"],
	[/(f)/gi, "ф"],
	[/(h)/gi, "х"],
	[/(c)/gi, "ц"],
];

export function LatinToCyrillic(text: string): string {
	let result = text;
	latinToCyrillicMap.forEach(([pattern, replacement]) => {
		result = result.replace(pattern, replacement);
	});
	return result;
}

export const toggleSelection = (
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

export const validateForm = ({
	index,
	studyTrack,
	year,
	studyEffort,
	passedSubjectsPerSemester,
	hasExtracurricular,
	setInvalidSubjects,
	totalCredits,
	creditsByLevel,
}: {
	index: string;
	studyTrack: StudyTrack | "";
	year: number;
	studyEffort: number | string;
	passedSubjectsPerSemester: Record<number, Subject[]>;
	hasExtracurricular: boolean;
	setInvalidSubjects: Dispatch<SetStateAction<Subject[]>>;
	totalCredits: Record<string, number>;
	creditsByLevel: Record<string, number[]>;
}) => {
	const errors: { [key: string]: string } = {};

	if (!index.trim()) {
		errors.index = "Индексот e задолжителен.";
	} else if (!/^\d{6}$/.test(index)) {
		errors.index = "Индексот треба да има точно 6 цифри.";
	}
	if (!studyTrack) errors.studyTrack = "Избери насока.";
	if (!year) errors.year = "Избери година.";
	if (!studyEffort) errors.studyEffort = "Избери пожелен вложен труд.";
	// passedSubjectsPerSemester is a map, not an array, that's why index 1 is needed, not 0
	if (passedSubjectsPerSemester[1].length === 0)
		errors.passedSubjectsPerSemester =
			"Избери барем еден предмет од прв семестар.";

	const passedSubjects = getPassedSubjects(passedSubjectsPerSemester);
	const invalid = checkPrerequisites(
		passedSubjects,
		hasExtracurricular,
		totalCredits,
		studyTrack,
		creditsByLevel
	);
	if (invalid.length != 0) {
		setInvalidSubjects(invalid);
		errors.invalidSubjects =
			"За еден или повеќе предмети не се исполнети условите";
	} else {
		setInvalidSubjects([]);
	}

	return errors;
};

export const mapToID = (passedSubjects: Record<number, Subject[]>) => {
	return Object.fromEntries(
		Object.entries(passedSubjects).map(([semester, subjects]) => [
			semester,
			subjects.map((subject) => subject.id),
		])
	);
};

export const mapToSubjects = (
	passedSubjects: Record<string, number[]> | Record<number, Subject[]>,
	subjects: Subject[]
) => {
	const mapped = Object.fromEntries(
		Object.entries(passedSubjects).map(([semester, subjectIDs]) => [
			semester,
			subjectIDs
				.map((id: SubjectID) => subjects.find((s) => s.id === id))
				.filter(Boolean),
		])
	);
	const normalized: Record<number, Subject[]> = Object.fromEntries(
		Object.entries(mapped).map(([k, arr]) => [
			Number(k),
			(arr as (Subject | undefined)[]).filter((s): s is Subject => !!s),
		])
	);
	return normalized || {};
};

export const getPassedSubjects = (
	passedSubjects: Record<number, Subject[]>
) => {
	return Object.values(passedSubjects).flatMap(
		(subjects: Subject[]) => subjects
	);
};
export const getPassedSubjectsByID = (
	passedSubjects: Record<number, Subject[]>
) => {
	return getPassedSubjects(passedSubjects).map((sub) => sub.id);
};

export const checkPrerequisites = (
	passedSubjects: Subject[],
	hasExtracurricular: boolean,
	totalCredits: Record<string, number>,
	studyTrack: StudyTrack | "",
	creditsByLevel: Record<string, number[]>
) => {
	passedSubjects.sort(
		(a, b) => a.subject_info.semester - b.subject_info.semester
	);
	const passedSubjectIds = new Set(passedSubjects.map((s) => s.id));
	const invalidSubjects: Subject[] = [];

	for (const subject of passedSubjects) {
		const prereqs = subject.subject_info.prerequisite;
		const prereqIDs = (prereqs["subjects"] as SubjectID[]) || [];

		if (prereqIDs.length > 0) {
			const hasAnyPrereq = prereqIDs.some((id) => passedSubjectIds.has(id));
			if (!hasAnyPrereq) {
				passedSubjectIds.delete(subject.id);
				invalidSubjects.push(subject);
			}
		}
	}

	totalCredits.value = (passedSubjectIds.size + Number(hasExtracurricular)) * 6;
	if (
		passedSubjects.some((s) => s.name === "Професионални вештини") &&
		passedSubjects.some((s) => s.name === "Спорт и здравје")
	) {
		totalCredits.value -= 6;
	}

	for (const subject of passedSubjects) {
		if (!passedSubjectIds.has(subject.id)) continue;
		const prereqs = subject.subject_info.prerequisite;
		// subtracting 6 because the current subject is counted in the total as well
		if (prereqs["credits"] && prereqs["credits"] > totalCredits.value - 6) {
			passedSubjectIds.delete(subject.id);
			totalCredits.value -= 6;
			invalidSubjects.push(subject);
		}
	}

	if (invalidSubjects.length == 0) {
		const newPassedSubjects = passedSubjects.filter((subject) =>
			passedSubjectIds.has(subject.id)
		);
		creditsByLevel.value = getCreditsByLevel(newPassedSubjects, studyTrack);
	}

	return invalidSubjects;
};

const getCreditsByLevel = (
	passedSubjects: Subject[],
	studyTrack: StudyTrack | ""
) => {
	return passedSubjects
		.reduce(
			(acc, subject) => {
				const level = subject.subject_info.level;
				if (
					studyTrack &&
					!subject.subject_info.mandatory_for.includes(studyTrack) &&
					((level == 1 && acc[0] < L1_LIMIT) ||
						(level == 2 && acc[1] < L2_LIMIT) ||
						level == 3)
				) {
					acc[level - 1]++;
				}
				return acc;
			},
			[0, 0, 0]
		)
		.map((i) => i * 6);
};
