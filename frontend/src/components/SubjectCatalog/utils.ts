import { EVALUATION_MAP_TO_MK } from "../../constants/subjects";
import { LatinToCyrillic } from "../StudentForm/utils";
import { Filters, StudyTrack, Subject } from "../types";

interface filteredSubjectsParams {
	searchTerm: string;
	professorSearchTerm: string;
	assistantSearchTerm: string;
	filters: {
		season: "W" | "S" | "";
		semester: number[];
		level: number[];
		activated: "activated" | "not_activated" | "";
		mandatoryFor: StudyTrack[];
		electiveFor: StudyTrack[];
		professors: string[];
		assistants: string[];
		hasPrerequisites: boolean | "";
		tags: string[];
		evaluation: string[];
	};
	subjects: Subject[];
}

export const filterSubjects = ({
	searchTerm,
	professorSearchTerm,
	assistantSearchTerm,
	filters,
	subjects,
}: filteredSubjectsParams) =>
	subjects?.filter((subject) => {
		let cyrilicSearchTerm = "";
		if (searchTerm !== "") {
			cyrilicSearchTerm = LatinToCyrillic(searchTerm).toLowerCase();
			searchTerm = searchTerm.toLowerCase();
		}
		const searchMatches =
			searchTerm === "" ||
			subject.name.toLowerCase().includes(cyrilicSearchTerm) ||
			subject.code.toLowerCase().includes(searchTerm) ||
			subject.abstract?.toLowerCase().includes(cyrilicSearchTerm);

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
				item
					.toLowerCase()
					.includes(LatinToCyrillic(professorSearchTerm).toLowerCase())
			);

		const assistantsMatches =
			assistantSearchTerm == "" ||
			subject.subject_info.assistants.some((item) =>
				item
					.toLowerCase()
					.includes(LatinToCyrillic(assistantSearchTerm).toLowerCase())
			);

		const prerequisitesMatch =
			filters.hasPrerequisites === "" ||
			(!filters.hasPrerequisites &&
				subject.subject_info.prerequisite &&
				Object.keys(subject.subject_info.prerequisite).length == 0) ||
			(filters.hasPrerequisites &&
				subject.subject_info.prerequisite &&
				Object.keys(subject.subject_info.prerequisite).length > 0);

		const tagsMatch =
			filters.tags.length == 0 ||
			subject.subject_info.tags.some((item) => filters.tags.includes(item));

		const evaluationMatch =
			filters.evaluation.length == 0 ||
			subject.subject_info.evaluation.some((item) =>
				filters.evaluation.includes(
					EVALUATION_MAP_TO_MK[item as keyof typeof EVALUATION_MAP_TO_MK]
				)
			);

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
			tagsMatch &&
			evaluationMatch
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
		hasPrerequisites: "",
		tags: [],
		evaluation: [],
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

export const getSubjectPrerequisites = (
	subject: Subject,
	subjectMap: Map<number, string>
): "Нема предуслов" | number | string => {
	const prerequisite = subject?.subject_info?.prerequisite;
	if (!prerequisite) return "Нема предуслов";

	if ("subjects" in prerequisite && Array.isArray(prerequisite.subjects)) {
		const names = prerequisite.subjects.map(
			(id) => subjectMap.get(id) || "Непознат предмет"
		);
		return names.length > 0 ? names.join(" или ") : "Нема предуслов";
	}

	if ("credits" in prerequisite && typeof prerequisite.credits === "number") {
		return prerequisite.credits;
	}

	return "Нема предуслов";
};
