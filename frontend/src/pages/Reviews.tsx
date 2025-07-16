import { CheckCircle, Eye, Trash2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { fetchSubjects } from "../api/subjects";
import Votes from "../components/Reviews/Votes";
import { LatinToCyrillic } from "../components/StudentForm/utils";
import { MAP_REVIEW_CATEGORY_TO_MK } from "../components/SubjectCatalog/utils";
import { EvaluationReview, OtherReview } from "../components/types";
import { EVALUATION_MAP_TO_MK } from "../constants/subjects";
import { useSubjects } from "../context/SubjectsContext";
import { useAuth } from "../hooks/useAuth";

type ReviewsList = (OtherReview | EvaluationReview)[];

interface ApiResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: ReviewsList;
}

const Reviews = () => {
	const [reviews, setReviews] = useState<ReviewsList>([]);
	const [loading, setLoading] = useState(false);
	const [nextUrl, setNextUrl] = useState<string | null>(null);
	const [filters, setFilters] = useState({
		type: "all", // all, evaluation, other
		subject: "all", // all | <subject_code>
		approved: "all", // all, approved, unapproved
		sort_by: "date", // date, votes
		sort_order: "desc", // asc, desc
		my_reviews: false, // show only user's own reviews
	});
	const [subjects, setSubjects] = useSubjects();
	const { user } = useAuth();
	const location = useLocation();
	const [subjectSearch, setSubjectSearch] = useState("");
	const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
	const [selectedSubject, setSelectedSubject] = useState<{
		name: string;
	} | null>(null);
	const [collapsedReviews, setCollapsedReviews] = useState<Set<number>>(
		new Set()
	);
	const [hasSearched, setHasSearched] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const code = location.state?.code || "";
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setShowSubjectDropdown(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		if (code) {
			setFilters((prev) => ({ ...prev, subject: code }));
			const subject = subjects.find((s) => s.code === code);
			if (subject) {
				setSelectedSubject({ name: subject.name });
			}
		}
	}, [code, subjects]);

	useEffect(() => {
		fetchSubjects(setSubjects);
	}, []);

	const fetchReviews = async (url?: string, reset = false) => {
		setLoading(true);
		setHasSearched(true);
		try {
			const params = new URLSearchParams();
			if (filters.type !== "all") params.append("type", filters.type);
			if (filters.subject !== "all")
				params.append("subject_code", filters.subject);
			if (filters.approved !== "all") {
				params.append(
					"is_confirmed",
					filters.approved === "approved" ? "true" : "false"
				);
			}
			params.append("sort_by", filters.sort_by);
			params.append("sort_order", filters.sort_order);
			if (filters.my_reviews) {
				params.append("my_reviews", "true");
			}

			const requestUrl =
				url || `/subjects/subjects-reviews-list/?${params.toString()}`;
			const response = await axiosInstance.get<ApiResponse>(requestUrl);
			if (reset) {
				setReviews(response.data.results);
			} else {
				setReviews((prev) => [...prev, ...response.data.results]);
			}
			setNextUrl(response.data.next);
		} catch (error) {
			console.error("Error fetching reviews:", error);
		} finally {
			setLoading(false);
		}
	};

	const toggleApproval = async (reviewId: number, currentStatus: boolean) => {
		try {
			await axiosInstance.patch(`/subjects/admin-subject-review/${reviewId}/`, {
				is_confirmed: !currentStatus,
			});
			setReviews((prev) =>
				prev.map((review) =>
					review.review.id === reviewId
						? {
								...review,
								review: { ...review.review, is_confirmed: !currentStatus },
						  }
						: review
				)
			);
		} catch (error) {
			console.error("Error updating review approval:", error);
		}
	};

	const deleteReview = async (reviewId: number) => {
		if (!confirm("Дали сте сигурни дека сакате да избришете?")) {
			return;
		}

		try {
			await axiosInstance.delete(`/subjects/admin-subject-review/${reviewId}/`);
			setReviews((prev) =>
				prev.filter((review) => review.review.id !== reviewId)
			);
		} catch (error) {
			console.error("Error deleting review:", error);
		}
	};

	const handleSearch = () => {
		fetchReviews(undefined, true);
	};

	const loadMore = () => {
		if (nextUrl && !loading) {
			fetchReviews(nextUrl);
		}
	};

	const isAdmin = user?.user_type === "admin";

	return (
		<div className="max-w-7xl mx-auto p-4 md:p-6 bg-white min-h-screen">
			<h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
				{isAdmin ? "Администраторски панел" : "Информации од студенти"}
			</h1>

			{/* filters */}
			<div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
				<div className="flex items-center space-x-4">
					<div className="flex flex-col items-start space-x-0 space-y-2 w-full">
						<div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-8 w-full">
							<div className="relative w-full md:w-auto" ref={dropdownRef}>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Предмет
								</label>
								<div className="relative">
									{selectedSubject === null && (
										<input
											type="text"
											value={subjectSearch}
											onChange={(e) => {
												setSubjectSearch(e.target.value);
												setShowSubjectDropdown(true);
											}}
											onFocus={() => setShowSubjectDropdown(true)}
											placeholder={`${
												selectedSubject === null ? "Пребарај предмет..." : ""
											}`}
											disabled={selectedSubject !== null}
											className={`w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
												selectedSubject ? "bg-gray-100 cursor-not-allowed" : ""
											}`}
										/>
									)}
									{showSubjectDropdown && !selectedSubject && (
										<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-10">
											{subjects
												.filter(
													(subject) =>
														subject.name
															.toLowerCase()
															.includes(subjectSearch.toLowerCase()) ||
														subject.name
															.toLowerCase()
															.includes(
																LatinToCyrillic(
																	subjectSearch.toLowerCase()
																).toLowerCase()
															)
												)
												.slice(0, 5)
												.map((subject) => (
													<div
														key={subject.code}
														className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
														onClick={() => {
															setSelectedSubject({
																name: subject.name,
															});
															setFilters((prev) => ({
																...prev,
																subject: subject.code,
															}));
															setSubjectSearch("");
															setShowSubjectDropdown(false);
														}}
													>
														{subject.name}
													</div>
												))}
										</div>
									)}
								</div>

								{selectedSubject && (
									<div className="mt-2">
										<span
											onClick={() => {
												setSelectedSubject(null);
												setFilters((prev) => ({ ...prev, subject: "all" }));
												setSubjectSearch("");
											}}
											className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm cursor-pointer hover:bg-blue-200 transition-colors"
										>
											{selectedSubject.name}
											<span className="ml-2 text-blue-600 hover:text-blue-800">
												×
											</span>
										</span>
									</div>
								)}
							</div>
							<div className="w-full md:w-auto">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Тип
								</label>
								<select
									value={filters.type}
									onChange={(e) =>
										setFilters((prev) => ({ ...prev, type: e.target.value }))
									}
									className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 custom-select"
								>
									<option value="all">Сите типови</option>
									<option value="evaluation">Информации за полагање</option>
									<option value="other">Други информации</option>
								</select>
							</div>
							<div className="w-full md:w-auto">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Статус на одобрување
								</label>
								<select
									value={filters.approved}
									onChange={(e) =>
										setFilters((prev) => ({
											...prev,
											approved: e.target.value,
										}))
									}
									className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 custom-select"
								>
									<option value="all">Сите</option>
									<option value="approved">Одобрени</option>
									<option value="unapproved">Неодобрени</option>
								</select>
							</div>
							<div className="w-full md:w-auto">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Сортирај по
								</label>
								<div className="flex space-x-2">
									<select
										value={filters.sort_by}
										onChange={(e) =>
											setFilters((prev) => ({
												...prev,
												sort_by: e.target.value,
											}))
										}
										className="flex-1 md:flex-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 custom-select"
									>
										<option value="date">Датум</option>
										<option value="votes">Гласови</option>
									</select>
									<button
										onClick={() =>
											setFilters((prev) => ({
												...prev,
												sort_order: prev.sort_order === "desc" ? "asc" : "desc",
											}))
										}
										className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
										title={`Сортирај ${
											filters.sort_order === "desc" ? "растечки" : "опаѓачки"
										}`}
									>
										{filters.sort_order === "desc" ? "↓" : "↑"}
									</button>
								</div>
							</div>
						</div>
						<div className="flex flex-col sm:flex-row pt-4 space-y-2 sm:space-y-0 sm:space-x-2 w-full">
							<button
								onClick={handleSearch}
								disabled={loading}
								className={`w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
									loading ? "bg-gray-400 cursor-not-allowed" : ""
								}`}
							>
								{loading ? "Се вчитува..." : "Пребарај"}
							</button>
							{user?.user_type === "student" && (
								<label className="flex items-center space-x-2 cursor-pointer select-none px-2 py-1 rounded-md transition-colors w-full sm:w-auto justify-center sm:justify-start">
									<input
										type="checkbox"
										checked={filters.my_reviews}
										onChange={(e) => {
											const newMyReviews = e.target.checked;
											setFilters((prev) => ({
												...prev,
												my_reviews: newMyReviews,
												subject: newMyReviews ? "all" : prev.subject,
											}));
											if (newMyReviews) {
												setSelectedSubject(null);
											}
										}}
										className="form-checkbox h-5 w-5 text-blue-600"
									/>
									<span className="text-gray-700 text-base">
										Прикажи само мои објави
									</span>
								</label>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-4">
				{hasSearched && reviews.length === 0 && !loading ? (
					<p className="text-gray-500 text-center py-8">
						Нема резултати за избраните филтри.
					</p>
				) : (
					reviews.map((review) => {
						const isUsersPost =
							!isAdmin && review.review.student == user?.student_index;
						return (
							<div
								key={review.review.id}
								className="border border-gray-200 rounded-lg p-4 md:p-6"
							>
								<div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-3 sm:space-y-0">
									<div className="flex-1">
										<div className="flex flex-wrap items-center gap-2 mb-2">
											{isUsersPost && (
												<span className="px-2 py-1 rounded text-xs font-medium bg-gray-100">
													Мој оглас
												</span>
											)}
											<span className="font-semibold text-base md:text-lg break-words">
												{review.review.subject.name} (
												{review.review.subject.code})
											</span>
											<span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
												{"methods" in review ? "Полагање" : "Други"}
											</span>
											{"category" in review && review.category && (
												<span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
													{
														MAP_REVIEW_CATEGORY_TO_MK[
															review.category as keyof typeof MAP_REVIEW_CATEGORY_TO_MK
														]
													}
												</span>
											)}
										</div>
										<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
											<span>{review.review.date_posted}</span>
											<span className="break-all">
												Студент: {review.review.student}{" "}
											</span>
											{isAdmin && (
												<span>
													Гласови:{" "}
													{`${
														review.review.votes_score ?? 0 > 0
															? "+"
															: review.review.votes_score ?? 0 < 0
															? "-"
															: ""
													}${review.review.votes_score}`}
												</span>
											)}
										</div>
									</div>
									<div className="flex items-center space-x-2 shrink-0 md:justify-end ">
										{!isAdmin && <Votes review={review.review} />}
										<button
											onClick={() => {
												const newCollapsed = new Set(collapsedReviews);
												if (newCollapsed.has(review.review.id!)) {
													newCollapsed.delete(review.review.id!);
												} else {
													newCollapsed.add(review.review.id!);
												}
												setCollapsedReviews(newCollapsed);
											}}
											className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
											title="Прегледај детали"
										>
											<Eye className="w-4 h-4" />
										</button>
										{isUsersPost && (
											<button
												onClick={() => deleteReview(review.review.id!)}
												className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
												title="Избриши"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										)}
										{isAdmin && (
											<>
												<button
													onClick={() =>
														toggleApproval(
															review.review.id!,
															review.review.is_confirmed!
														)
													}
													className={`p-2 rounded ${
														review.review.is_confirmed
															? "text-red-600 hover:text-red-800 hover:bg-red-50"
															: "text-green-600 hover:text-green-800 hover:bg-green-50"
													}`}
													title={
														review.review.is_confirmed
															? "Означи како неодобрено"
															: "Означи како одобрено"
													}
												>
													{review.review.is_confirmed ? (
														<XCircle className="w-4 h-4" />
													) : (
														<CheckCircle className="w-4 h-4" />
													)}
												</button>
												<button
													onClick={() => deleteReview(review.review.id!)}
													className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
													title="Избриши"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</>
										)}
									</div>
								</div>

								<div className="flex items-center space-x-2 mb-3">
									<span
										className={`text-sm font-medium ${
											review.review.is_confirmed
												? "text-green-600"
												: "text-red-600"
										}`}
									>
										{review.review.is_confirmed ? "✓ Одобрено" : "✗ Неодобрено"}
									</span>
								</div>

								{!collapsedReviews.has(review.review.id!) && (
									<div className="mt-4 pt-4 border-t border-gray-200">
										{"methods" in review ? (
											<div className="space-y-4">
												<h4 className="font-medium">Начини на оценување:</h4>
												{review.methods?.map((method, index) => (
													<div key={index} className="bg-gray-50 rounded p-3">
														<p className="font-medium mb-2">
															Метод {index + 1}:
														</p>
														{method.note && (
															<p className="text-sm text-gray-600 mb-2">
																Забелешка: {method.note}
															</p>
														)}
														<div className="overflow-x-auto">
															<table className="min-w-full border border-gray-300 text-sm">
																<thead className="bg-gray-100">
																	<tr>
																		<th className="px-2 md:px-3 py-2 text-left text-xs md:text-sm font-medium">
																			Активност
																		</th>
																		<th className="px-2 md:px-3 py-2 text-left text-xs md:text-sm font-medium">
																			Процент
																		</th>
																	</tr>
																</thead>
																<tbody>
																	{method.components.map((component, idx) => (
																		<tr key={idx}>
																			<td className="px-2 md:px-3 py-2 text-xs md:text-sm border-b break-words">
																				{
																					EVALUATION_MAP_TO_MK[
																						(component.category
																							.charAt(0)
																							.toUpperCase() +
																							component.category.slice(
																								1
																							)) as keyof typeof EVALUATION_MAP_TO_MK
																					]
																				}
																			</td>
																			<td className="px-2 md:px-3 py-2 text-xs md:text-sm border-b">
																				{component.percentage}%
																			</td>
																		</tr>
																	))}
																</tbody>
															</table>
														</div>
													</div>
												))}
												<div>
													<strong>Услов за потпис:</strong>{" "}
													{review.signature_condition || "Нема"}
												</div>
											</div>
										) : (
											<div>
												<h4 className="font-medium mb-2">Содржина:</h4>
												<p className="text-gray-700 break-words">
													{"content" in review
														? review.content
														: "Нема содржина"}
												</p>
											</div>
										)}
									</div>
								)}
							</div>
						);
					})
				)}

				{nextUrl && (
					<div className="flex justify-center pt-6">
						<button
							onClick={loadMore}
							disabled={loading}
							className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
						>
							{loading ? "Се вчитува..." : "Вчитај уште"}
						</button>
					</div>
				)}
			</div>

			{loading && reviews.length === 0 && (
				<div className="flex justify-center py-8">
					<div className="text-gray-500">Се вчитува...</div>
				</div>
			)}
		</div>
	);
};

export default Reviews;
