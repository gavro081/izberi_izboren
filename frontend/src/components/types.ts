import { STUDY_TRACKS } from "../constants/subjects";

export interface Subject {
	id: number;
	code: string;
	name: string;
	abstract: string;
	subject_info: SubjectInfo;
}

export type SubjectID = Subject["id"];

export interface StudentData {
	// id: number;
	index: string;
	study_track: StudyTrack;
	current_year: number;
	// passed_subjects: Subject[];
	study_effort: number;
	tags: string[];
	technologies: string[];
	evaluation: string[];
	professors: string[];
	assistants: string[];
	has_filled_form: boolean;
	has_extracurricular: boolean;
	passed_subjects_per_semester: Record<string, number[]> | [];
}

export type Prerequisite = {
	subjects?: number[];
	credits?: number;
	none?: true;
};

export interface SubjectInfo {
	level: number;
	prerequisite: Prerequisite;
	activated: boolean;
	participants: number[];
	mandatory: boolean;
	mandatory_for: StudyTrack[];
	semester: number;
	season: string;
	elective_for: StudyTrack[];
	professors: string[];
	assistants: string[];
	tags: string[];
	technologies: string[];
	evaluation: string[];
	is_easy: boolean;
}

export type Filters = {
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

export type StudyTrack = (typeof STUDY_TRACKS)[number];
