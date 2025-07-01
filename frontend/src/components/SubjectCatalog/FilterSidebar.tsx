import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { EVALUATIONS, STUDY_TRACKS } from "../../constants/subjects";
import { Filters } from "../types";
import { resetFilters } from "./utils";
interface FilterSidebarProps {
	setSearchTerm: (term: string) => void;
	setProfessorSearchTerm: (term: string) => void;
	setAssistantSearchTerm: (term: string) => void;
	setFilters: (filters: (prev: Filters) => Filters) => void;
	filters: Filters;
	tags: string[];
}

const FilterHeader = ({
	label,
	filterKey,
	openFilters,
	toggleFilter,
	children,
}: {
	label: string;
	filterKey: string;
	openFilters: { [key: string]: boolean };
	toggleFilter: (key: string) => void;
	children: React.ReactNode;
}) => (
	<div className="mb-2">
		<button
			type="button"
			className="w-full flex justify-between items-center py-2"
			onClick={() => toggleFilter(filterKey)}
		>
			<span className="font-medium">{label}</span>
			<ChevronDown
				className="h-4 w-4 text-gray-500"
				style={{
					transform: openFilters[filterKey] ? "rotate(180deg)" : "rotate(0deg)",
					transition: "transform 0.2s ease-in-out",
				}}
			/>
		</button>
		{openFilters[filterKey] && children}
	</div>
);

const FilterSidebar = ({
	setSearchTerm,
	setProfessorSearchTerm,
	setAssistantSearchTerm,
	setFilters,
	filters,
	tags,
}: FilterSidebarProps) => {
	const [showTags, setShowTags] = useState(false);
	const [openFilters, setOpenFilters] = useState<{ [key: string]: boolean }>(
		{}
	);
	const [isFiltersVisible, setIsFiltersVisible] = useState(false);

	const toggleFilter = (key: string) => {
		setOpenFilters((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const handleResetFilters = () => {
		resetFilters(
			setSearchTerm,
			setProfessorSearchTerm,
			setAssistantSearchTerm,
			setFilters
		);
		setOpenFilters({});
	};

	return (
		<div className="w-full">
			<div className="flex justify-between items-center mb-4">
				<button
					className="flex items-center space-x-2 text-left md:hidden"
					onClick={() => setIsFiltersVisible(!isFiltersVisible)}
				>
					<h2 className="text-lg font-semibold">Филтри</h2>
					<ChevronDown
						className="h-4 w-4 text-gray-500"
						style={{
							transform: isFiltersVisible ? "rotate(180deg)" : "rotate(0deg)",
							transition: "transform 0.2s ease-in-out",
						}}
					/>
				</button>

				<h2 className="hidden md:block text-lg font-semibold">Филтри</h2>
				<button
					onClick={handleResetFilters}
					className="text-sm text-gray-600 hover:text-gray-900"
				>
					Избриши
				</button>
			</div>

			<div className={`mb-4 md:block ${isFiltersVisible ? "block" : "hidden"}`}>
				<FilterHeader
					label="Сезона"
					filterKey="season"
					openFilters={openFilters}
					toggleFilter={toggleFilter}
				>
					<div className="grid grid-cols-2 mb-2 mt-1">
						{["Летен", "Зимски"].map((season) => {
							const seasonValue = season === "Летен" ? "S" : "W";
							return (
								<div key={season} className="flex items-center space-x-2">
									<input
										type="checkbox"
										name="season"
										id={seasonValue}
										onChange={() =>
											setFilters((prev) => ({
												...prev,
												season: prev.season === seasonValue ? "" : seasonValue,
											}))
										}
										checked={filters.season === seasonValue}
										className="h-4 w-4 rounded border-gray-300 text-blue-600"
									/>
									<label
										htmlFor={seasonValue}
										className="ml-2 text-sm text-gray-700"
									>
										{season}
									</label>
								</div>
							);
						})}
					</div>
				</FilterHeader>

				<FilterHeader
					label="Семестар"
					filterKey="semester"
					openFilters={openFilters}
					toggleFilter={toggleFilter}
				>
					<div className="grid grid-cols-4 gap-2 mb-2 mt-1">
						{Array.from(Array(8)).map((_, index) => {
							const i = index + 1;
							return (
								<div key={i} className="flex items-center space-x-2">
									<input
										type="checkbox"
										name="semester"
										id={`s${i}`}
										onChange={() =>
											setFilters((prev) => ({
												...prev,
												semester: prev.semester.includes(i)
													? prev.semester.filter((item) => item !== i)
													: [...prev.semester, i],
											}))
										}
										checked={filters.semester.includes(i)}
										className="h-4 w-4 rounded border-gray-300 text-blue-600"
									/>
									<label htmlFor={`s${i}`} className="text-sm text-gray-700">
										{i}
									</label>
								</div>
							);
						})}
					</div>
				</FilterHeader>

				<FilterHeader
					label="Ниво"
					filterKey="level"
					openFilters={openFilters}
					toggleFilter={toggleFilter}
				>
					<div className="flex gap-4 sm:grid sm:grid-cols-3 mb-2 mt-1">
						{Array.from(Array(3)).map((_, index) => {
							const i = index + 1;
							const level = `L${i}`;
							return (
								<div key={i} className="flex items-center space-x-2">
									<input
										type="checkbox"
										name="level"
										id={level}
										onChange={() =>
											setFilters((prev) => ({
												...prev,
												level: prev.level.includes(i)
													? prev.level.filter((item) => item !== i)
													: [...prev.level, i],
											}))
										}
										checked={filters.level.includes(i)}
										className="h-4 w-4 rounded border-gray-300 text-blue-600"
									/>
									<label
										htmlFor={`s${level}`}
										className="text-sm text-gray-700 whitespace-nowrap"
									>
										{level}
									</label>
								</div>
							);
						})}
					</div>
				</FilterHeader>

				<FilterHeader
					label="Активирани"
					filterKey="activated"
					openFilters={openFilters}
					toggleFilter={toggleFilter}
				>
					<div className="grid grid-cols-2 mb-2 mt-1">
						{["Активирани", "Неактивирани"].map((value) => {
							const activeValue =
								value === "Активирани" ? "activated" : "not_activated";
							return (
								<div key={activeValue} className="flex items-center space-x-2">
									<input
										type="checkbox"
										name="activated"
										id={activeValue}
										onChange={() =>
											setFilters((prev) => ({
												...prev,
												activated:
													prev.activated === activeValue ? "" : activeValue,
											}))
										}
										checked={filters.activated === activeValue}
										className="h-4 w-4 rounded border-gray-300 text-blue-600"
									/>
									<label
										htmlFor={activeValue}
										className="ml-2 text-sm text-gray-700"
									>
										{value}
									</label>
								</div>
							);
						})}
					</div>
				</FilterHeader>

				<FilterHeader
					label="Задолжителен за:"
					filterKey="mandatoryFor"
					openFilters={openFilters}
					toggleFilter={toggleFilter}
				>
					<div className="grid grid-cols-3 gap-2 mb-2 mt-1">
						{STUDY_TRACKS.map((track) => {
							const studyTrack = track.replace(/\d+$/, "");
							return (
								<div key={track} className="flex items-center space-x-2">
									<input
										type="checkbox"
										name="mandatoryFor"
										id={track}
										onChange={() =>
											setFilters((prev) => ({
												...prev,
												mandatoryFor: prev.mandatoryFor.includes(track)
													? prev.mandatoryFor.filter((item) => item !== track)
													: [...prev.mandatoryFor, track],
											}))
										}
										checked={filters.mandatoryFor.includes(track)}
										className="h-4 w-4 rounded border-gray-300 text-blue-600"
									/>
									<label
										htmlFor={`s${track}`}
										className="text-sm text-gray-700"
									>
										{studyTrack}
									</label>
								</div>
							);
						})}
					</div>
				</FilterHeader>

				<FilterHeader
					label="Изборен за:"
					filterKey="electiveFor"
					openFilters={openFilters}
					toggleFilter={toggleFilter}
				>
					<div className="grid grid-cols-3 gap-2 mb-2 mt-1">
						{STUDY_TRACKS.map((track) => {
							const studyTrack = track.replace(/\d+$/, "");
							return (
								<div key={track} className="flex items-center space-x-2">
									<input
										type="checkbox"
										name="electiveFor"
										id={track}
										onChange={() =>
											setFilters((prev) => ({
												...prev,
												electiveFor: prev.electiveFor.includes(track)
													? prev.electiveFor.filter((item) => item !== track)
													: [...prev.electiveFor, track],
											}))
										}
										checked={filters.electiveFor.includes(track)}
										className="h-4 w-4 rounded border-gray-300 text-blue-600"
									/>
									<label
										htmlFor={`s${track}`}
										className="text-sm text-gray-700"
									>
										{studyTrack}
									</label>
								</div>
							);
						})}
					</div>
				</FilterHeader>

				<FilterHeader
					label="Предуслови"
					filterKey="prereq"
					openFilters={openFilters}
					toggleFilter={toggleFilter}
				>
					<div className="flex flex-col gap-2 mb-2 mt-1">
						<label className="flex items-center space-x-2">
							<input
								type="checkbox"
								name="prereqsNo"
								id="prereqsNo"
								onChange={() =>
									setFilters((prev) => ({
										...prev,
										hasPrerequisites:
											prev.hasPrerequisites === false ? "" : false,
									}))
								}
								checked={filters.hasPrerequisites === false}
								className="h-4 w-4 text-blue-600"
							/>
							<span className="text-sm text-gray-700">
								Предметот нема предуслови
							</span>
						</label>
						<label className="flex items-center space-x-2">
							<input
								type="checkbox"
								name="prereqYes"
								id="prereqsYes"
								onChange={() =>
									setFilters((prev) => ({
										...prev,
										hasPrerequisites:
											prev.hasPrerequisites === true ? "" : true,
									}))
								}
								checked={filters.hasPrerequisites === true}
								className="h-4 w-4 text-blue-600"
							/>
							<span className="text-sm text-gray-700">
								Предметот има предуслови
							</span>
						</label>
					</div>
				</FilterHeader>

				<FilterHeader
					label="Тагови"
					filterKey="tags"
					openFilters={openFilters}
					toggleFilter={toggleFilter}
				>
					<div className="grid grid-cols-1 gap-2 mb-2">
						{tags.slice(0, showTags ? undefined : 4).map((tag) => {
							return (
								<div key={tag} className="flex items-center space-x-2">
									<input
										type="checkbox"
										name="tags"
										id={tag}
										onChange={() =>
											setFilters((prev) => ({
												...prev,
												tags: prev.tags.includes(tag)
													? prev.tags.filter((item) => item !== tag)
													: [...prev.tags, tag],
											}))
										}
										checked={filters.tags.includes(tag)}
										className="h-4 w-4 rounded border-gray-300 text-blue-600"
									/>
									<label htmlFor={`${tag}`} className="text-sm text-gray-700">
										{tag}
									</label>
								</div>
							);
						})}
						{tags.length > 4 && (
							<button
								onClick={() => setShowTags(!showTags)}
								className="text-sm text-blue-600 hover:text-blue-800"
							>
								{showTags ? "Прикажи помалку" : "Прикажи повеќе"}
							</button>
						)}
					</div>
				</FilterHeader>

				<FilterHeader
					label="Евалуација"
					filterKey="evaluation"
					openFilters={openFilters}
					toggleFilter={toggleFilter}
				>
					<div className="grid grid-cols-2 gap-2 mb-2 mt-1">
						{EVALUATIONS.map((evalType) => (
							<div key={evalType} className="flex items-center space-x-2">
								<input
									type="checkbox"
									name="evaluation"
									id={evalType}
									onChange={() =>
										setFilters((prev) => ({
											...prev,
											evaluation: prev.evaluation.includes(evalType)
												? prev.evaluation.filter((item) => item !== evalType)
												: [...prev.evaluation, evalType],
										}))
									}
									checked={filters.evaluation.includes(evalType)}
									className="h-4 w-4 rounded border-gray-300 text-blue-600"
								/>
								<label htmlFor={evalType} className="text-sm text-gray-700">
									{evalType}
								</label>
							</div>
						))}
					</div>
				</FilterHeader>
			</div>
		</div>
	);
};

export default FilterSidebar;
