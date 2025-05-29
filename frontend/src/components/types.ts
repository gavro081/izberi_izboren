import { PROGRAMS } from "../constants/subjects";

export interface Subject {
	id: number;
	code: string;
	name: string;
	abstract: string;
	subject_info: SubjectInfo;
}

export interface StudentData {
	id: number;
	index: string;
	study_track: Programs;
	current_year: number;
	passed_subjects: Subject[];
	study_effort: string;
	preferred_domains: string[];
	preferred_technologies: string[];
	preferred_evaluation: string[];
	favorite_professors: string[];
}

type Prerequisite =
	| { subjects: number[] }
	| { credits: number }
	| { none: true };

export interface SubjectInfo {
	level: number;
	short: string;
	prerequisite: Prerequisite;
	activated: boolean;
	participants: number[];
	mandatory: boolean;
	mandatory_for: Programs[];
	semester: number;
	season: string;
	elective_for: Programs[];
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
	mandatoryFor: Programs[];
	electiveFor: Programs[];
	professors: string[];
	assistants: string[];
	hasPrerequisites: boolean;
};

export type Programs = (typeof PROGRAMS)[number];
