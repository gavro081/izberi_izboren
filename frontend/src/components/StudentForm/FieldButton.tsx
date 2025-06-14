import { Dispatch, SetStateAction } from "react";
import { toggleSelection } from "./utils";

const FieldButton: React.FC<{
	keyProp: string | number;
	state: string[];
	stateSetter: Dispatch<SetStateAction<any[]>>;
	field: "prof" | "tech" | "eval" | "domains" | "ass";
	isSelected: boolean;
	isDisabled: boolean;
	setIsNemamSelected: Dispatch<
		SetStateAction<{
			domains: boolean;
			tech: boolean;
			eval: boolean;
			prof: boolean;
			ass: boolean;
		}>
	>;
	searchSetter?: Dispatch<SetStateAction<string>>;
}> = ({
	keyProp,
	state,
	stateSetter,
	field,
	isSelected,
	isDisabled,
	setIsNemamSelected,
	searchSetter,
}) => {
	const handleClick = () => {
		if (searchSetter) searchSetter("");
		if (keyProp === "Немам") {
			if (state.includes("None")) {
				stateSetter([]);
			} else {
				stateSetter(["None"]);
			}
			setIsNemamSelected((prev) => ({
				...prev,
				[field]: !prev[field],
			}));
		} else {
			const new_ = state.filter((t) => t !== "Немам");
			toggleSelection(keyProp, stateSetter, new_);
		}
	};

	return (
		<button
			type="button"
			key={keyProp}
			onClick={handleClick}
			disabled={isDisabled}
			className={`px-3 py-2 border rounded-md transition-colors ${
				isSelected
					? "bg-green-100 border-green-300 text-green-800"
					: "bg-white hover:bg-gray-50 border-gray-300"
			} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
		>
			{keyProp}
		</button>
	);
};

export default FieldButton;
