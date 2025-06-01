import { Programs, Subject } from "../types";

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
}: {
	index: string;
	studyTrack: Programs | "";
	year: number;
	studyEffort: number | string;
	passedSubjectsPerSemester: Record<number, Subject[]>;
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
	if (passedSubjectsPerSemester[1].length === 0)
		errors.passedSubjectsPerSemester = "Одбери барем еден предмет.";
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
