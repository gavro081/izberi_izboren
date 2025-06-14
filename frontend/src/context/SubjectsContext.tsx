import {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useContext,
	useState,
	useEffect,
} from "react";
import { Subject } from "../components/types";

type SubjectsContextType = [Subject[], Dispatch<SetStateAction<Subject[]>>];

const SubjectsContext = createContext<SubjectsContextType>([[], () => {}]);

interface SubjectsProviderProps {
	children: ReactNode;
}

export const SubjectsProvider = ({ children }: SubjectsProviderProps) => {
	const [subjects, setSubjects] = useState<Subject[]>([]);

	useEffect(() => {
		const fetchSubjects = async () => {
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

		fetchSubjects();
	}, []); 

	return (
		<SubjectsContext.Provider value={[subjects, setSubjects]}>
			{children}
		</SubjectsContext.Provider>
	);
};

export const useSubjects = () => useContext(SubjectsContext);
