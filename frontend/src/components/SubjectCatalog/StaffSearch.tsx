interface StaffSearchProps {
	randomStaff: string[];
	professorSearchTerm: string;
	setProfessorSearchTerm: (val: string) => void;
	assistantSearchTerm: string;
	setAssistantSearchTerm: (val: string) => void;
}

function StaffSearch({
	randomStaff,
	professorSearchTerm,
	setProfessorSearchTerm,
	assistantSearchTerm,
	setAssistantSearchTerm,
}: StaffSearchProps) {
	return (
		<>
			<div className="mb-6 relative">
				<h3 className="mb-2 font-medium">Пребарај по професор: </h3>
				<input
					type="text"
					placeholder={randomStaff[0]}
					value={professorSearchTerm}
					onChange={(e) => {
						return setProfessorSearchTerm(e.target.value);
					}}
					className="w-full py-3 px-2 border border-gray-300 rounded-lg
								focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>
			<div className="mb-6 relative">
				<h3 className="mb-2 font-medium">Пребарај по асистент: </h3>
				<input
					type="text"
					placeholder={randomStaff[1]}
					value={assistantSearchTerm}
					onChange={(e) => {
						return setAssistantSearchTerm(e.target.value);
					}}
					className="w-full py-3 px-2 border border-gray-300 rounded-lg
								focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>
		</>
	);
}

export default StaffSearch;
