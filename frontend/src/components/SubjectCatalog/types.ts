import { PROGRAMS } from "../../constants/subjects";

export interface Subject {
	id: number;
	code: string;
	name: string;
	abstract: string;
	info: SubjectInfo;
}

type Prerequisite = { subjects: number[] } | { credits: number } | {};

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
