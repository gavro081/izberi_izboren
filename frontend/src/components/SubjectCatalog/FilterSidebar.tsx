import { useState } from "react";
import { STUDY_TRACKS } from "../../constants/subjects";
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

const FilterSidebar = ({
	setSearchTerm,
	setProfessorSearchTerm,
	setAssistantSearchTerm,
	setFilters,
	filters,
	tags,
}: FilterSidebarProps) => {
	const [showTags, setShowTags] = useState(false);
	return (
		<div className="">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-lg font-semibold">Филтри</h2>
				<button
					onClick={() =>
						resetFilters(
							setSearchTerm,
							setProfessorSearchTerm,
							setAssistantSearchTerm,
							setFilters
						)
					}
					className="text-sm text-gray-600 hover:text-gray-900"
				>
					Избриши
				</button>
			</div>
			<div className="mb-4">
				{/* filter by season*/}
				<div className="space-y-1 mb-4">
					<h3 className="font-medium mb-2">Семестар</h3>
					<div className="grid grid-cols-2">
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
				</div>
				{/* filter by semester*/}
				<div className="space-y-1 mb-4">
					{/* <h3 className="font-medium mb-2">Семестар</h3> */}
					<div className="grid grid-cols-4 gap-2">
						{Array.from(Array(8)).map((_, index) => {
							const i = index + 1;
							return (
								<div key={i} className="flex items-center space-x-2">
									<input
										type="checkbox"
										name="season"
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
				</div>
				{/* filter by level */}
				<div className="space-y-1 mb-4">
					<h3 className="font-medium mb-2">Ниво</h3>
					<div className="grid grid-cols-3">
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
										className="text-sm text-gray-700"
									>
										{level}
									</label>
								</div>
							);
						})}
					</div>
				</div>
				{/* filter by activation*/}
				<div className="space-y-1 mb-4">
					<h3 className="font-medium mb-2">Активирани</h3>
					<div className="grid grid-cols-2">
						{["Активирани", "Неактивирани"].map((value) => {
							const activeValue =
								value === "Активирани" ? "activated" : "not_activated";
							return (
								<div key={activeValue} className="flex items-center space-x-2">
									<input
										type="checkbox"
										name="season"
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
				</div>
				{/* filter by mandatoryFor */}
				<div className="space-y-1 mb-4">
					<h3 className="font-medium mb-2">Задолжителен за:</h3>
					<div className="grid grid-cols-3 gap-2">
						{STUDY_TRACKS.map((track) => {
							const studyTrack = track.replace(/\d+$/, "");
							return (
								<div key={track} className="flex items-center space-x-2">
									<input
										type="checkbox"
										name="level"
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
				</div>
				{/* filter by electiveFor */}
				<div className="space-y-1 mb-6">
					<h3 className="font-medium mb-2">Изборен за:</h3>
					<div className="grid grid-cols-3 gap-2">
						{STUDY_TRACKS.map((track) => {
							const studyTrack = track.replace(/\d+$/, "");
							return (
								<div key={track} className="flex items-center space-x-2">
									<input
										type="checkbox"
										name="level"
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
				</div>
				{/* filter by prereq */}
				<div className="space-y-1 mb-4">
					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							name="prereq"
							id="prereq"
							onChange={() =>
								setFilters((prev) => ({
									...prev,
									hasPrerequisites: !prev.hasPrerequisites,
								}))
							}
							checked={filters.hasPrerequisites}
							className="h-4 w-4 rounded border-gray-300 text-blue-600"
						/>
						<label htmlFor={"prereq"} className="text-sm text-gray-700">
							Предметот нема предуслови
						</label>
					</div>
				</div>
				<div className="space-y-1 mb-4">
					<h3 className="font-medium mb-2">Тагови:</h3>
					<div className="grid grid-cols-1 gap-2">
						{tags.slice(0, showTags ? undefined : 4).map((tag) => {
							return (
								<div key={tag} className="flex items-center space-x-2">
									<input
										type="checkbox"
										name="level"
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
				</div>
			</div>
		</div>
	);
};

export default FilterSidebar;
