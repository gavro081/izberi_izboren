export const STUDY_TRACKS = [
	"SIIS23",
	"IMB23",
	"PIT23",
	"IE23",
	"KI23",
	"KN23",
] as const;

export const L1_LIMIT = 1;
export const L2_LIMIT = 6;

export const STUDY_EFFORT = [1, 2, 3, 4, 5] as const;
export const YEARS = [1, 2, 3, 4] as const;
export const EVALUATIONS = ["Теорија", "Практично", "Код", "Проект"];

export const EVALUATIONS_MAP = {
	Немам: "None",
	None: "None",
	Теорија: "Theory",
	Практично: "Practical",
	Код: "Code",
	Проект: "Project",
};
