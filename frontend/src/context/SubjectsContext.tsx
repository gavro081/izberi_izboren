import {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useContext,
	useState,
} from "react";
import { Subject } from "../components/types";

type SubjectsContextType = [Subject[], Dispatch<SetStateAction<Subject[]>>];

const SubjectsContext = createContext<SubjectsContextType>([[], () => {}]);

interface SubjectsProviderProps {
	children: ReactNode;
}

export const SubjectsProvider = ({ children }: SubjectsProviderProps) => {
	const [subjects, setSubjects] = useState<Subject[]>([]);

	return (
		<SubjectsContext.Provider value={[subjects, setSubjects]}>
			{children}
		</SubjectsContext.Provider>
	);
};

export const useSubjects = () => useContext(SubjectsContext);
