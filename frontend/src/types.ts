import { PROGRAMS } from "./constants/subjects";

export interface Subject {
	id: number;
	code: string;
	name: string;
	abstract: string;
	info: SubjectInfo;
}

export interface SubjectInfo {
	level: number;
	short: string;
	prerequisite: string;
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

export type Programs = (typeof PROGRAMS)[number];
