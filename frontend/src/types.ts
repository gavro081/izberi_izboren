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
	mandatory_for: string[];
	semester: number;
	season: string;
	elective_for: string[];
	professors: string[];
	assistants: string[];
}
