import { Filters, Programs, Subject } from "../types";

interface filteredSubjectsParams {
	subjectData: Subject[];
	searchTerm: string;
	professorSearchTerm: string;
	assistantSearchTerm: string;
	filters: {
		season: "W" | "S" | "";
		semester: number[];
		level: number[];
		activated: "activated" | "not_activated" | "";
		mandatoryFor: Programs[];
		electiveFor: Programs[];
		professors: string[];
		assistants: string[];
		hasPrerequisites: boolean;
		tags: string[];
	};
}

export const filterSubjects = ({
	subjectData,
	searchTerm,
	professorSearchTerm,
	assistantSearchTerm,
	filters,
}: filteredSubjectsParams) =>
	subjectData.filter((subject) => {
		const searchMatches =
			subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			subject.abstract?.toLowerCase().includes(searchTerm.toLowerCase());

		const seasonMatches =
			filters.season === "" || filters.season === subject.subject_info.season;

		const semesterMatches =
			filters.semester.length === 0 ||
			filters.semester.includes(subject.subject_info.semester);

		const levelMatches =
			filters.level.length === 0 ||
			filters.level.includes(subject.subject_info.level);

		const activatedMatches =
			filters.activated == "" ||
			(filters.activated == "activated" && subject.subject_info.activated) ||
			(filters.activated == "not_activated" && !subject.subject_info.activated);

		const mandatoryMatches =
			filters.mandatoryFor.length === 0 ||
			subject.subject_info.mandatory_for.some((item) =>
				filters.mandatoryFor.includes(item)
			);

		const electiveMatches =
			filters.electiveFor.length === 0 ||
			subject.subject_info.elective_for.some((item) =>
				filters.electiveFor.includes(item)
			);

		const professorsMatches =
			professorSearchTerm == "" ||
			subject.subject_info.professors.some((item) =>
				item.toLowerCase().includes(professorSearchTerm.toLowerCase())
			);

		const assistantsMatches =
			assistantSearchTerm == "" ||
			subject.subject_info.assistants.some((item) =>
				item.toLowerCase().includes(assistantSearchTerm.toLowerCase())
			);

		const prerequisitesMatch =
			!filters.hasPrerequisites || subject.subject_info.prerequisite == null;

		const tagsMatch =
			filters.tags.length == 0 ||
			subject.subject_info.tags.some((item) => filters.tags.includes(item));
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
			prerequisitesMatch &&
			tagsMatch
		);
	});

export const resetFilters = (
	setSearchTerm: (val: string) => void,
	setProfessorSearchTerm: (val: string) => void,
	setAssistantSearchTerm: (val: string) => void,
	setFilters: (val: (prev: Filters) => Filters) => void
) => {
	setSearchTerm("");
	setProfessorSearchTerm("");
	setAssistantSearchTerm("");
	setFilters(() => ({
		season: "",
		semester: [],
		level: [],
		activated: "",
		mandatoryFor: [],
		electiveFor: [],
		professors: [],
		assistants: [],
		hasPrerequisites: false,
		tags: [],
	}));
};

export const getRandomStaff = (
	subjectData: Subject[],
	setRandomStaff: ([]: string[]) => void
) => {
	if (subjectData.length == 0) return;
	const getRandomProfessor = () => {
		const randomSubject1 =
			subjectData[Math.floor(Math.random() * subjectData.length)];
		return randomSubject1?.subject_info.professors[
			Math.floor(Math.random() * randomSubject1.subject_info.professors.length)
		];
	};
	const getRandomAssistant = () => {
		const randomSubject2 =
			subjectData[Math.floor(Math.random() * subjectData.length)];
		return randomSubject2?.subject_info.assistants[
			Math.floor(Math.random() * randomSubject2.subject_info.assistants.length)
		];
	};
	let randomProfessor = "";
	let randomAssistant = "";

	while (!randomProfessor) randomProfessor = getRandomProfessor();
	while (!randomAssistant) randomAssistant = getRandomAssistant();

	setRandomStaff([randomProfessor, randomAssistant]);
};
