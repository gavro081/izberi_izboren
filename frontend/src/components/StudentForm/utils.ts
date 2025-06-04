import { Dispatch, SetStateAction } from "react";
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

// console.log(LatinToCyrillic("abvgdGjezhzijklLjmnnjOprstkjufhcchdjsh"));

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
	setTotalCredits,
}: {
	index: string;
	studyTrack: StudyTrack | "";
	year: number;
	studyEffort: number | string;
	passedSubjectsPerSemester: Record<number, Subject[]>;
	hasExtracurricular: boolean;
	setInvalidSubjects: Dispatch<SetStateAction<Subject[]>>;
	setTotalCredits: Dispatch<SetStateAction<number>>;
}) => {
	const errors: { [key: string]: string } = {};

	if (!index.trim()) {
		errors.index = "Индексот e задолжителен.";
	} else if (!/^\d{6}$/.test(index)) {
		errors.index = "Индексот треба да има точно 6 цифри.";
	}
	if (!studyTrack) errors.studyTrack = "Одбери насока.";
	if (!year) errors.year = "Одбери година.";
	if (!studyEffort) errors.studyEffort = "Одбери пожелен вложен труд.";
	// passedSubjectsPerSemester e mapa ne e array, zatoa 1 ne 0
	if (passedSubjectsPerSemester[1].length === 0)
		errors.passedSubjectsPerSemester =
			"Одбери барем еден предмет од прв семестар.";

	const passedSubjects = getPassedSubjects(passedSubjectsPerSemester);
	const invalid = checkPrerequisites(
		passedSubjects,
		hasExtracurricular,
		setTotalCredits
	);
	if (invalid.length != 0) {
		setInvalidSubjects(invalid);
		errors.invalidSubjects =
			"За еден или повеќе предмети не се исполнети условите";
	} else setInvalidSubjects([]);

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
	setTotalCredits: Dispatch<SetStateAction<number>>
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

	let totalCredits = passedSubjectIds.size * 6 + (hasExtracurricular ? 1 : 0);
	if (
		passedSubjects.some((s) => s.name === "Професионални вештини") &&
		passedSubjects.some((s) => s.name === "Спорт и здравје")
	) {
		totalCredits -= 6;
	}

	for (const subject of passedSubjects) {
		if (!passedSubjectIds.has(subject.id)) continue;
		const prereqs = subject.subject_info.prerequisite;
		// subtracting 6 because the current subject is counted in the total as well
		if (prereqs["credits"] && prereqs["credits"] > totalCredits - 6) {
			passedSubjectIds.delete(subject.id);
			totalCredits -= 6;
			invalidSubjects.push(subject);
		}
	}

	if (invalidSubjects.length == 0) setTotalCredits(totalCredits);

	return invalidSubjects;
};
