import { Subject } from "../types";

interface SubjectModalProps {
	selectedSubject: Subject;
	subjectPrerequisites: string | number | "Нема предуслов";
	closeModal: () => void;
}

function SubjectModal({
	selectedSubject,
	closeModal,
	subjectPrerequisites,
}: SubjectModalProps) {
	return (
		<>
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
				<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[93vh] overflow-y-auto">
					<div className="p-6">
						<div className="flex justify-between items-start mb-4">
							<div>
								<h2 className="text-2xl font-bold">{selectedSubject.name}</h2>
							</div>
							<button
								onClick={closeModal}
								className="text-gray-400 hover:text-gray-600"
							>
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						<div className="mb-2">
							<h3 className="text-lg font-medium">Професори:</h3>
							<p>
								{selectedSubject.subject_info.professors.length == 0
									? "Нема одредени професори"
									: selectedSubject.subject_info.professors.join(", ")}
							</p>
						</div>
						<div className="mb-4">
							<h3 className="text-lg font-medium">Асистенти:</h3>
							<p>
								{selectedSubject.subject_info.assistants.length == 0
									? "Нема одредени асистенти"
									: selectedSubject.subject_info.assistants.join(", ")}
							</p>
						</div>

						<div className="bg-gray-50 rounded-lg p-4 mb-3">
							<h3 className="text-lg font-medium mb-4">
								Информации за предметот
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<div className="flex items-center mb-3">
										<div>
											<p className="text-sm text-gray-500">
												Препорачан семестар
											</p>
											<p className="font-medium">
												{selectedSubject.subject_info.semester}
											</p>
										</div>
									</div>
									<div className="flex items-center mb-3">
										<div>
											<p className="text-sm text-gray-500">Зимски / Летен</p>
											<p className="font-medium">
												{selectedSubject.subject_info.season == "S"
													? "Летен"
													: "Зимски"}
											</p>
										</div>
									</div>
									<div className="flex items-center mb-3">
										<div>
											<p className="text-sm text-gray-500">Ниво</p>
											<p className="font-medium">
												L{selectedSubject.subject_info.level}
											</p>
										</div>
									</div>
								</div>
								<div>
									<div className="flex items-center mb-3">
										<div>
											<p className="text-sm text-gray-500">Задолжителен за:</p>
											<p className="font-medium">
												{selectedSubject.subject_info.mandatory_for.length == 0
													? "Не е задолжителен предмет"
													: selectedSubject.subject_info.mandatory_for
															.map((s) => s.replace(/\d+$/, ""))
															.join(", ")}
											</p>
										</div>
									</div>
									<div className="flex items-center mb-3">
										<div>
											<p className="text-sm text-gray-500">Изборен за:</p>
											<p className="font-medium">
												{selectedSubject.subject_info.elective_for.length == 0
													? "Не е изборен предмет"
													: selectedSubject.subject_info.elective_for
															.map((s) => s.replace(/\d+$/, ""))
															.join(", ")}
											</p>
										</div>
									</div>
									<div className="flex items-center mb-3">
										<div>
											<p className="text-sm text-gray-500">Предуслови:</p>
											<p className="font-medium">
												{typeof subjectPrerequisites === "string"
													? subjectPrerequisites
													: typeof subjectPrerequisites === "number"
													? `${subjectPrerequisites} кредити`
													: "Нема предуслов"}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div>
							{selectedSubject.subject_info.participants[0] == 0 ? (
								<div className="bg-red-500 py-3 pl-2 rounded-md">
									Овој предмет не бил активиран минатиот семестар.
								</div>
							) : (
								<p>{`Овој предмет минатиот семестар бил запишан од
									${selectedSubject.subject_info.participants[0]} студенти.`}</p>
							)}
						</div>

						<div className="mt-8 flex justify-end space-x-3">
							<button
								onClick={closeModal}
								className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-normal rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
							>
								Затвори
							</button>
							{/* <button
									onClick={closeModal}
									className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
								>
									Погледни
								</button> */}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
export default SubjectModal;
