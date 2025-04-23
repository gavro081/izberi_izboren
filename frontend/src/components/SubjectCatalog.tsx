import { useEffect, useState } from "react";
import { Subject } from "../types";
import SubjectModal from "./SubjectModal";
const SubjectCatalog = () => {
	const [visibleCourses, setVisibleCourses] = useState<number>(10);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
	const [subjectData, setSubjectData] = useState<Subject[]>([]);
	const [isLoaded, setIsLoaded] = useState(false);
	const [showModal, setShowModal] = useState(false);

	const SkeletonCard = () => {
		return (
			<div className="w-full px-4 py-8 border rounded-md shadow animate-pulse bg-white">
				<div className="h-4 w-3/4 bg-gray-300 rounded mb-2.5"></div>
				<div className="h-4 w-1/2 bg-gray-200 rounded mb-7"></div>

				<div className="h-4 w-full bg-gray-200 rounded mb-1"></div>
				<div className="h-4 w-5/6 bg-gray-200 rounded mb-3"></div>

				<div className="flex gap-2 mb-7">
					<div className="h-5 w-20 bg-gray-300 rounded-full"></div>
					<div className="h-5 w-24 bg-gray-300 rounded-full"></div>
					<div className="h-5 w-16 bg-gray-300 rounded-full"></div>
				</div>

				<div className="flex justify-between items-center">
					<div className="h-6 w-20 bg-gray-300 rounded-lg"></div>
					<div className="h-6 w-20 bg-gray-300 rounded-full"></div>
				</div>
			</div>
		);
	};

	const filteredSubjects = subjectData.filter(
		(subject) =>
			subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			subject.abstract?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch("http://localhost:8000/subjects");
			const data = await response.json();
			setSubjectData(data.subjects);
			setIsLoaded(true);
		};
		fetchData();
	}, []);

	const loadMore = () => {
		setVisibleCourses((prev) => prev + 10);
	};

	const openSubjectDetails = (subject: Subject) => {
		setSelectedSubject(subjectData[subject.id - 1]);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
	};

	return (
		<div className="mx-auto p-4 bg-white min-h-screen">
			<h1 className="text-3xl font-bold mb-6">Преглед на сите предмети</h1>
			<div className="flex flex-col md:flex-row gap-6">
				{/* filters sidebar */}
				<div className="w-full md:w-64 bg-gray-50 p-4 rounded-lg">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-lg font-semibold">Филтри</h2>
						<button
							onClick={() => console.log("reset filters; not implemented yet")}
							className="text-sm text-gray-600 hover:text-gray-900"
						>
							Избриши
						</button>
					</div>

					{/* TODO: add more filters following this template*/}
					<div className="mb-4">
						<h3 className="font-medium mb-2">Filter criterium</h3>
						<div className="space-y-1">
							{["make", "this", "work"].map((dept) => (
								<div key={dept} className="flex items-center">
									<input
										type="checkbox"
										id={`dept-${dept}`}
										checked={true}
										onChange={() =>
											console.log("filtering logic; not implemented yet")
										}
										className="h-4 w-4 rounded border-gray-300 text-blue-600"
									/>
									<label
										htmlFor={`dept-${dept}`}
										className="ml-2 text-sm text-gray-700"
									>
										{dept}
									</label>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Main content */}
				<div className="flex-1">
					{/* Search bar */}
					<div className="mb-6 relative">
						<input
							type="text"
							placeholder="Пребарувај предмети по име, код, опис..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full p-3 pl-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
						<button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-4 py-1 rounded-lg">
							Search
						</button>
					</div>

					{/* Course grid */}

					{!isLoaded ? (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
							{[...Array(9)].map((_, index) => (
								<SkeletonCard key={index} />
							))}
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
							{filteredSubjects.slice(0, visibleCourses).map((subject) => (
								<div
									key={subject.id}
									className="border border-gray-200 rounded-lg overflow-hidden shadow-sm 
                                    hover:shadow-md transition-shadow duration-200"
								>
									<div className="p-4 min-h-full flex flex-col">
										<div className="flex justify-between items-start mb-2">
											<div>
												<h3 className="text-lg font-semibold">
													{subject.name}
												</h3>
												<p className="text-gray-600">{subject.code}</p>
											</div>
										</div>

										<p className="text-gray-700 text-sm mb-4 line-clamp-2">
											<strong>tuka treba abstract:</strong> Lorem ipsum dolor
											sit, amet consectetur adipisicing elit. Et praesentium
											dolores est animi officiis aperiam.
											{subject.abstract}
										</p>

										<div className="flex flex-wrap gap-2 mb-4">
											{/* these tags are for listing the domains a subject covers, ex. backend, AI ...*/}
											{[
												"Web Development",
												"Machine Learning",
												"Data Science",
											].map((tag) => (
												<span
													key={tag}
													className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
												>
													{tag}
												</span>
											))}
										</div>

										<div className="flex justify-between mt-auto">
											{/* these tags could be used as certain flags for some subjects, like most picked subject, best match etc. */}
											<div className="flex gap-3">
												<div className="bg-red-500 px-1 py-1 rounded-full text-sm font-medium">
													TAG1
												</div>
												<div className="bg-green-500 px-1 py-1 rounded-full text-sm font-medium">
													TAG2
												</div>
											</div>
											<button
												onClick={() => openSubjectDetails(subject)}
												className="flex items-center text-gray-700 hover:text-gray-900"
											>
												<img
													src="src/assets/eye.svg"
													className="w-4 h-4 mr-1"
												/>
												Погледни детали
											</button>
											{/* this could lead to a subject view page, for now there is no such thing*/}
											{/* if implemented, tags should be moved elsewhere*/}
											{/* <button
											onClick={() => openCourseDetails(course)}
											className="flex items-center text-blue-600 hover:text-blue-800"
										>
											Погледни детали
											<svg
												className="w-4 h-4 ml-1"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 5l7 7-7 7"
												/>
											</svg>
										</button> */}
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Load more button */}
					{isLoaded && filteredSubjects.length > visibleCourses && (
						<div className="mt-5 text-center">
							<button
								onClick={loadMore}
								className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
							>
								Погледни повеќе
							</button>
						</div>
					)}

					{/* No results message */}
					{isLoaded && filteredSubjects.length === 0 && (
						<div className="text-center py-12">
							<p className="text-gray-500 text-lg">
								Не постојат такви предмети
							</p>
							<button
								onClick={() =>
									console.log("reset filters; not implemented yet")
								}
								className="mt-2 text-blue-600 hover:text-blue-800"
							>
								Ресетирај филтри
							</button>
						</div>
					)}
				</div>
			</div>
			{showModal && selectedSubject && (
				<SubjectModal
					selectedSubject={selectedSubject}
					closeModal={closeModal}
				/>
			)}
		</div>
	);
};

export default SubjectCatalog;
