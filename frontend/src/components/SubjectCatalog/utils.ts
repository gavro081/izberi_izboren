import { Filters, Programs, Subject } from "./types";

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
};
