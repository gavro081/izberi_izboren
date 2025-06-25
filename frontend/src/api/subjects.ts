import { Dispatch, SetStateAction } from "react";
import { Subject } from "../components/types";

interface fetchSubjectsProps {
	setSubjects: Dispatch<SetStateAction<Subject[]>>;
}

export const fetchSubjects = async ({ setSubjects }: fetchSubjectsProps) => {
	try {
		const resSubjects = await fetch("http://localhost:8000/subjects/");
		if (resSubjects.ok) {
			const subJson: Subject[] = await resSubjects.json();
			setSubjects(subJson || []);
		}
	} catch (error) {
		console.error("Error fetching subjects:", error);
	}
};
