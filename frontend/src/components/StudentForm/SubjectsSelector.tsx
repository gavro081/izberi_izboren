import { Dispatch, SetStateAction } from "react";
import { StudyTrack, Subject } from "../types";
import { LatinToCyrillic } from "./utils";

interface SubjectsSelectorProps {
	studyTrack: StudyTrack | "";
	year: number;
	filteredMandatorySubjects: Subject[];
	filteredElectiveSubjects: Subject[];
	toggleSubject: (id: Subject, semester: number) => void;
	semesterSearchTerms: Record<number, string>;
	setSemesterSearchTerms: (term: any) => void;
	validationErrors: { [key: string]: string };
	passedSubjectsPerSemester: Record<number, Subject[]>;
	setPassedSubjectsPerSemester: Dispatch<
		SetStateAction<Record<number, Subject[]>>
	>;
	invalidSubjects: Subject[];
}

function SubjectsSelector({
	studyTrack,
	year,
	filteredMandatorySubjects,
	filteredElectiveSubjects,
	toggleSubject,
	semesterSearchTerms,
	setSemesterSearchTerms,
	validationErrors,
	passedSubjectsPerSemester,
	setPassedSubjectsPerSemester,
	invalidSubjects,
}: SubjectsSelectorProps) {
	return (
		<div>
			<h3 className="text-lg font-medium text-gray-900 mb-4">
				Положени предмети по семестри
			</h3>
			{studyTrack ? (
				<div className="grid gap-6">
					{/* uncomment for displaying 2 semesters side by side on large screens, for now this is good*/}
					{/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
					{(() => {
						const semestersToShow = Array.from(
							{ length: year * 2 },
							(_, i) => i + 1
						);

						return semestersToShow.map((semester) => {
							const semesterMandatory = filteredMandatorySubjects.filter(
								(subject) => subject.subject_info.semester === semester
							);

							const semesterElectives = filteredElectiveSubjects.filter(
								(subject) => subject.subject_info.semester === semester
							);

							const seasonElectives = filteredElectiveSubjects.filter(
								(subject) => subject.subject_info.semester % 2 === semester % 2
							);

							const totalSlots = semester === 1 ? 5 : 6;
							const electiveSlots = totalSlots - semesterMandatory.length;

							const electivesSource =
								(semesterSearchTerms[semester] || "") === ""
									? semesterElectives
									: seasonElectives;

							const selectedElectivesForSemester = (
								passedSubjectsPerSemester[semester] || []
							).filter((subject) =>
								subject.subject_info.elective_for.includes(studyTrack)
							);

							const semesterInvalid = invalidSubjects.filter(
								(subject: Subject) =>
									(passedSubjectsPerSemester[semester] || []).some(
										(s) => s.id === subject.id
									)
							);
							return (
								<div
									key={semester}
									className="border border-gray-200 rounded-lg p-4 bg-gray-50"
								>
									<h4 className="text-md font-medium text-gray-800 mb-3">
										Семестар {semester}
									</h4>

									<div className="space-y-4">
										{semesterMandatory.length > 0 && (
											<div>
												<div className="flex items-center gap-4">
													<h5 className="text-sm font-medium text-gray-700 mb-2">
														Задолжителни предмети
													</h5>
													<button
														className="mb-2 px-3 py-2 border rounded-md transition-colors duration-200 text-sm text-white bg-blue-500 hover:bg-blue-800"
														disabled={filteredMandatorySubjects.length === 0}
														type="button"
														onClick={() => {
															const semesterMandatory =
																filteredMandatorySubjects.filter(
																	(subject) =>
																		subject.subject_info.semester === semester
																);

															const allSelected = semesterMandatory.every(
																(subject) =>
																	(
																		passedSubjectsPerSemester[semester] || []
																	).some((s) => s.id === subject.id)
															);

															if (allSelected) {
																setPassedSubjectsPerSemester((prev) => ({
																	...prev,
																	[semester]: (prev[semester] || []).filter(
																		(subject) =>
																			!semesterMandatory.some(
																				(mandatory) =>
																					mandatory.id === subject.id
																			)
																	),
																}));
															} else {
																setPassedSubjectsPerSemester((prev) => {
																	const existing = prev[semester] || [];
																	const newSubjects = semesterMandatory.filter(
																		(mandatory) =>
																			!existing.some(
																				(s) => s.id === mandatory.id
																			)
																	);
																	return {
																		...prev,
																		[semester]: [...existing, ...newSubjects],
																	};
																});
															}
														}}
													>
														Одбери ги сите
													</button>
												</div>
												<div className="flex flex-wrap gap-2">
													{semesterMandatory.map((subject) => {
														const isSelected = (
															passedSubjectsPerSemester[semester] || []
														).some((s) => s.id === subject.id);
														const isInvalid = semesterInvalid.some(
															(s) => s.id === subject.id
														);
														return (
															<button
																type="button"
																key={subject.id}
																onClick={() => toggleSubject(subject, semester)}
																className={`flex items-center gap-2 px-3 py-2 border rounded-md transition-all duration-200 text-sm
                                  									// TODO
																	//prettier-ignore
																	${
																		isInvalid
																			? "bg-red-300 border-red-400 text-red-700"
																			: isSelected
																			? "bg-green-500 border-green-600 text-green-50"
																			: "bg-white hover:bg-gray-50 border-gray-300"
																	}`}
																aria-pressed={isSelected}
															>
																{isSelected && !isInvalid && (
																	<img
																		src="src/assets/tick.svg"
																		className="w-4 h-4 mr-1"
																	/>
																)}
																<span>{subject.name}</span>
															</button>
														);
													})}
												</div>
											</div>
										)}

										{electiveSlots > 0 && (
											<div>
												<h5 className="text-sm font-medium text-gray-700 mb-2">
													Изборни предмети (
													{selectedElectivesForSemester.length}/{electiveSlots})
												</h5>

												<input
													type="text"
													placeholder={`Пребарај ${
														semester % 2 === 0 ? "летни" : "зимски"
													} изборни предмети`}
													value={semesterSearchTerms[semester] || ""}
													disabled={
														selectedElectivesForSemester.length >= electiveSlots
													}
													className="w-full px-3 py-2 mb-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none 
														focus:ring-blue-500 focus:border-blue-500  disabled:opacity-50 disabled:cursor-not-allowed"
													onChange={(e) => {
														setSemesterSearchTerms((prev: any) => ({
															...prev,
															[semester]: e.target.value,
														}));
													}}
												/>

												{selectedElectivesForSemester.length > 0 && (
													<div className="mb-3">
														<div className="flex flex-wrap gap-2">
															{selectedElectivesForSemester.map((subject) => {
																const isInvalid = semesterInvalid.some(
																	(s) => s.id === subject.id
																);
																return (
																	<button
																		type="button"
																		key={subject.id}
																		onClick={() =>
																			toggleSubject(subject, semester)
																		}
																		className={`flex items-center gap-2 px-3 py-2 border rounded-md transition-all duration-200 text-sm  shadow-md
       																 	${
																					isInvalid
																						? "bg-red-300 border-red-400 text-red-700"
																						: "bg-green-500 text-white border-green-600"
																				}`}
																		aria-pressed={true}
																	>
																		{!isInvalid && (
																			<img
																				src="src/assets/tick.svg"
																				className="w-4 h-4 mr-1"
																			/>
																		)}
																		<span>{subject.name}</span>
																	</button>
																);
															})}
														</div>
													</div>
												)}

												{selectedElectivesForSemester.length <
													electiveSlots && (
													<div>
														<p className="text-xs text-gray-600 mb-2">
															Избери од достапните:
														</p>
														<div className="flex flex-wrap gap-2 h-max">
															{electivesSource
																.filter(
																	(subject) =>
																		!Object.values(
																			passedSubjectsPerSemester
																		).some((arr) =>
																			arr.some((s) => s.id === subject.id)
																		) &&
																		!semesterMandatory.includes(subject) &&
																		((semesterSearchTerms[semester] || "") ===
																			"" ||
																			subject.name
																				.toLowerCase()
																				.includes(
																					(
																						LatinToCyrillic(
																							semesterSearchTerms[semester]
																						) || ""
																					).toLowerCase()
																				))
																)
																.sort(
																	(a, b) =>
																		b.subject_info.participants[0] -
																		a.subject_info.participants[0]
																)
																.slice(0, 8)
																.map((subject) => {
																	const isInvalid = semesterInvalid.some(
																		(s) => s.id === subject.id
																	);
																	return (
																		<button
																			type="button"
																			key={subject.id}
																			onClick={() => {
																				if (
																					selectedElectivesForSemester.length <
																					electiveSlots
																				) {
																					setSemesterSearchTerms(
																						(prev: any) => ({
																							...prev,
																							[semester]: "",
																						})
																					);
																					toggleSubject(subject, semester);
																				}
																			}}
																			disabled={
																				selectedElectivesForSemester.length >=
																				electiveSlots
																			}
																			className={`flex items-center gap-2 px-3 py-2 border rounded-md transition-all duration-200 text-sm bg-white text-gray-800 border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
          																		${isInvalid ? "bg-red-300 border-red-400 text-red-700" : ""}`}
																		>
																			<span>{subject.name}</span>
																		</button>
																	);
																})}
														</div>
														<p className="mt-3 text-xs text-gray-500 px-2 py-1">
															Не можеш да го најдеш твојот предмет? Пребарај го.
														</p>
													</div>
												)}
											</div>
										)}
									</div>
									{semester == 1 &&
										validationErrors.passedSubjectsPerSemester && (
											<p className="mt-5 ml-1 text-sm text-red-600 font-bold">
												{validationErrors.passedSubjectsPerSemester}
											</p>
										)}
								</div>
							);
						});
					})()}
				</div>
			) : (
				<p className="text-gray-500 italic">
					Избери смер и година за да се прикажат предметите.
				</p>
			)}
		</div>
	);
}

export default SubjectsSelector;
