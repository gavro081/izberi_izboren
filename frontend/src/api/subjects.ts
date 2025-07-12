import { Dispatch, SetStateAction } from "react";
import { Subject } from "../components/types";

export const fetchSubjects = async (
	setSubjects: Dispatch<SetStateAction<Subject[]>>
) => {
	try {
		const resSubjects = await fetch("http://localhost:8000/subjects/all/");
		if (resSubjects.ok) {
			const subJson: Subject[] = await resSubjects.json();
			setSubjects(subJson || []);
		}
	} catch (error) {
		console.error("Error fetching subjects:", error);
	}
};
