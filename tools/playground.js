import { readFile } from "fs/promises";

const subject_data = JSON.parse(
	await readFile("./data/subject_details.json", "utf8")
);
// console.log(subject_data);
const subject_count = Object.keys(subject_data).length;

const inactive_subjects = Object.keys(subject_data).filter(
	(item) => !subject_data[item]["activated"]
);

// mandatory subjects sorted in descending order by the number of programs that have them
const mandatory_subjects = Object.keys(subject_data)
	.map((item) => {
		if (subject_data[item]["mandatory"]) {
			return {
				name: item,
				mandatoryFor: subject_data[item]["mandatoryFor"],
			};
		}
		return null;
	})
	.filter(Boolean)
	.sort((a, b) => {
		return b["mandatoryFor"].length - a["mandatoryFor"].length;
	});

// console.log(mandatory_subjects);
console.log(`Total subjects: ${subject_count}`);
console.log(`Inactive subjects: ${inactive_subjects.length}`);
console.log(`Mandatory subjects: ${mandatory_subjects.length}`);
