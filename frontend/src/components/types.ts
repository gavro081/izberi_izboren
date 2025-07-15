import { STUDY_TRACKS } from "../constants/subjects";

export type UserType = "admin" | "student";

export interface User {
	full_name: string;
	user_type: UserType;
	student_index?: string;
}

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

export interface EvaluationComponent {
	category:
		| "project"
		| "theory"
		| "practical"
		| "homework"
		| "attendance"
		| "presentation";
	percentage: number;
}

export interface EvaluationMethod {
	note?: string;
	components: EvaluationComponent[];
}

export interface EvaluationReview {
	review: Review;
	methods: EvaluationMethod[];
	signature_condition: string;
}

export interface OtherReview {
	review: Review;
	category: "material" | "staff" | "other";
	content: string;
}

export interface ReviewSubject {
	name: string;
	code: string;
}

export interface Review {
	id?: number;
	student?: string;
	is_confirmed?: boolean;
	votes_score?: number;
	subject: ReviewSubject;
	user_has_voted?: "none" | "up" | "down";
	date_posted: string;
}

export interface Reviews {
	evaluation: EvaluationReview[];
	other: OtherReview[];
}
