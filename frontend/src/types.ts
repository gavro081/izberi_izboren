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

export interface Course {
	id: number;
	name: string;
	code: string;
	credits: number;
	description: string;
	department: string;
	semester: string;
	duration: string;
	prerequisites: string;
	level: "Beginner" | "Intermediate" | "Advanced";
	tags: string[];
	learningOutcomes?: string[];
}

export const courseData: Course[] = [
	{
		id: 1,
		name: "Introduction to Computer Science",
		code: "CS 101",
		credits: 3,
		description:
			"A foundational course covering the basic principles of computer science, including algorithms, data structures, and problem-solving techniques.",
		department: "Computer Science",
		semester: "Fall",
		duration: "15 weeks",
		prerequisites: "None",
		level: "Beginner",
		tags: ["Programming", "Algorithms", "Beginner"],
		learningOutcomes: [
			"Understand fundamental programming concepts",
			"Develop basic problem-solving skills",
			"Implement simple algorithms",
			"Analyze program efficiency",
		],
	},
	{
		id: 2,
		name: "Data Structures and Algorithms",
		code: "CS 201",
		credits: 4,
		description:
			"An in-depth exploration of data structures and algorithms, focusing on implementation, analysis, and application to real-world problems.",
		department: "Computer Science",
		semester: "Spring",
		duration: "15 weeks",
		prerequisites: "CS 101",
		level: "Intermediate",
		tags: ["Data Structures", "Algorithms", "Intermediate"],
	},
	{
		id: 3,
		name: "Database Systems",
		code: "CS 301",
		credits: 3,
		description:
			"Introduction to database design, implementation, and management, covering relational models, SQL, and database optimization techniques.",
		department: "Computer Science",
		semester: "Fall",
		duration: "15 weeks",
		prerequisites: "CS 201",
		level: "Intermediate",
		tags: ["Databases", "SQL", "Intermediate"],
	},
	{
		id: 4,
		name: "Artificial Intelligence",
		code: "CS 401",
		credits: 4,
		description:
			"Exploration of AI concepts including search algorithms, knowledge representation, machine learning, and natural language processing.",
		department: "Computer Science",
		semester: "Spring",
		duration: "15 weeks",
		prerequisites: "CS 201, MATH 240",
		level: "Advanced",
		tags: ["AI", "Machine Learning", "Advanced"],
	},
	{
		id: 5,
		name: "Calculus I",
		code: "MATH 101",
		credits: 4,
		description:
			"Introduction to differential and integral calculus, covering limits, derivatives, integrals, and their applications.",
		department: "Mathematics",
		semester: "Fall",
		duration: "15 weeks",
		prerequisites: "None",
		level: "Beginner",
		tags: ["Calculus", "Mathematics", "Beginner"],
	},
	{
		id: 6,
		name: "Linear Algebra",
		code: "MATH 201",
		credits: 3,
		description:
			"Study of vector spaces, linear transformations, matrices, determinants, eigenvalues, and eigenvectors.",
		department: "Mathematics",
		semester: "Spring",
		duration: "15 weeks",
		prerequisites: "MATH 101",
		level: "Intermediate",
		tags: ["Linear Algebra", "Mathematics", "Intermediate"],
	},
	{
		id: 7,
		name: "Classical Mechanics",
		code: "PHYS 201",
		credits: 4,
		description:
			"Study of motion, forces, energy, and momentum in physical systems using Newtonian mechanics.",
		department: "Physics",
		semester: "Fall",
		duration: "15 weeks",
		prerequisites: "PHYS 101, MATH 101",
		level: "Intermediate",
		tags: ["Mechanics", "Physics", "Intermediate"],
	},
	{
		id: 8,
		name: "Electromagnetics",
		code: "PHYS 301",
		credits: 4,
		description:
			"Study of electromagnetic fields, waves, and their applications in modern technology.",
		department: "Physics",
		semester: "Spring",
		duration: "15 weeks",
		prerequisites: "PHYS 201, MATH 201",
		level: "Advanced",
		tags: ["Electromagnetics", "Physics", "Advanced"],
	},
	{
		id: 9,
		name: "Circuit Analysis",
		code: "ENG 201",
		credits: 3,
		description:
			"Introduction to the analysis of electrical circuits, including DC and AC circuits, network theorems, and operational amplifiers.",
		department: "Engineering",
		semester: "Fall",
		duration: "15 weeks",
		prerequisites: "PHYS 201, MATH 201",
		level: "Intermediate",
		tags: ["Circuits", "Engineering", "Intermediate"],
	},
	{
		id: 10,
		name: "Signals and Systems",
		code: "ENG 301",
		credits: 4,
		description:
			"Analysis of continuous and discrete signals and systems in both time and frequency domains.",
		department: "Engineering",
		semester: "Spring",
		duration: "15 weeks",
		prerequisites: "ENG 201, MATH 301",
		level: "Advanced",
		tags: ["Signals", "Systems", "Engineering", "Advanced"],
	},
	{
		id: 11,
		name: "Discrete Mathematics",
		code: "MATH 240",
		credits: 3,
		description:
			"Introduction to discrete mathematical structures including sets, logic, combinatorics, graphs, and number theory.",
		department: "Mathematics",
		semester: "Fall",
		duration: "15 weeks",
		prerequisites: "MATH 101",
		level: "Intermediate",
		tags: ["Discrete Math", "Mathematics", "Intermediate"],
	},
	{
		id: 12,
		name: "Operating Systems",
		code: "CS 350",
		credits: 4,
		description:
			"Study of operating system principles, including process management, memory management, file systems, and security.",
		department: "Computer Science",
		semester: "Fall",
		duration: "15 weeks",
		prerequisites: "CS 201",
		level: "Advanced",
		tags: ["OS", "Systems", "Advanced"],
	},
];
