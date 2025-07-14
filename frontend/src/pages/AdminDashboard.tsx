import { CheckCircle, Eye, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { MAP_REVIEW_CATEGORY_TO_MK } from "../components/SubjectCatalog/utils";
import { EvaluationReview, OtherReview } from "../components/types";
import { EVALUATION_MAP_TO_MK } from "../constants/subjects";

type AdminReviewsList = (OtherReview | EvaluationReview)[];

interface ApiResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: AdminReviewsList;
}

const AdminDashboard = () => {
	const [reviews, setReviews] = useState<AdminReviewsList>([]);
	const [loading, setLoading] = useState(false);
	const [nextUrl, setNextUrl] = useState<string | null>(null);
	const [filters, setFilters] = useState({
		type: "all", // "all", "evaluation", "other"
		approved: "all", // "all", "approved", "unapproved"
	});
	const [expandedReview, setExpandedReview] = useState<number | null>(null);

	const fetchReviews = async (url?: string, reset = false) => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (filters.type !== "all") params.append("type", filters.type);
			if (filters.approved !== "all") {
				params.append(
					"is_confirmed",
					filters.approved === "approved" ? "true" : "false"
				);
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

	useEffect(() => {
		fetchReviews(undefined, true);
	}, []);

	const toggleApproval = async (reviewId: number, currentStatus: boolean) => {
		try {
			await axiosInstance.patch(`/subjects/admin/reviews/${reviewId}/`, {
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
			await axiosInstance.delete(`/subjects/admin/reviews/${reviewId}/`);
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

	return (
		<div className="max-w-7xl mx-auto p-6 bg-white">
			<h1 className="text-3xl font-bold mb-8">Администраторски панел</h1>

			<div className="bg-gray-50 rounded-lg p-4 mb-6">
				<div className="flex items-center space-x-4">
					<div className="flex flex-col items-start space-x-0 space-y-2">
						<div className="flex flex-col md:flex-row md:space-x-8">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Тип
								</label>
								<select
									value={filters.type}
									onChange={(e) =>
										setFilters((prev) => ({ ...prev, type: e.target.value }))
									}
									className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 custom-select"
								>
									<option value="all">Сите</option>
									<option value="evaluation">Информации за полагање</option>
									<option value="other">Други информации</option>
								</select>
							</div>
							<div>
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
									className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500  custom-select"
								>
									<option value="all">Сите</option>
									<option value="approved">Одобрени</option>
									<option value="unapproved">Неодобрени</option>
								</select>
							</div>
						</div>
						<div className="flex pt-4">
							<button
								onClick={handleSearch}
								disabled={loading}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								{loading ? "Се вчитува..." : "Пребарај"}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Reviews List */}
			<div className="space-y-4">
				{reviews.length === 0 && !loading ? (
					<p className="text-gray-500 text-center py-8">
						Нема рецензии според избраните филтри.
					</p>
				) : (
					reviews.map((review) => (
						<div
							key={review.review.id}
							className="border border-gray-200 rounded-lg p-6"
						>
							<div className="flex items-start justify-between mb-4">
								<div className="flex-1">
									<div className="flex items-center space-x-3 mb-2">
										<span className="font-semibold text-lg">
											{review.review.subject.name} ({review.review.subject.code}
											)
										</span>
										<span
											className={
												"px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
											}
										>
											{/* className={`px-2 py-1 rounded text-xs font-medium ${ 
												"methods" in review
													? "bg-blue-100 text-blue-800"
													: "bg-purple-100 text-purple-800"
											}`}
										>
										*/}
											{/* make api specify types to prevent this */}
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
									<div className="flex items-center space-x-4 text-sm text-gray-600">
										<span>Студент: {review.review.student}</span>
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
									</div>
								</div>
								<div className="flex items-center space-x-2">
									<button
										onClick={() =>
											setExpandedReview(
												expandedReview === review.review.id
													? null
													: review.review.id ?? null
											)
										}
										className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
										title="Прегледај детали"
									>
										<Eye className="w-4 h-4" />
									</button>
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

							{/* Expanded Details */}
							{expandedReview === review.review.id && (
								<div className="mt-4 pt-4 border-t border-gray-200">
									{"methods" in review ? (
										<div className="space-y-4">
											<h4 className="font-medium">Начини на оценување:</h4>
											{review.methods?.map((method, index) => (
												<div key={index} className="bg-gray-50 rounded p-3">
													<p className="font-medium mb-2">Метод {index + 1}:</p>
													{method.note && (
														<p className="text-sm text-gray-600 mb-2">
															Забелешка: {method.note}
														</p>
													)}
													<div className="overflow-x-auto">
														<table className="min-w-full border border-gray-300">
															<thead className="bg-gray-100">
																<tr>
																	<th className="px-3 py-2 text-left text-sm font-medium">
																		Активност
																	</th>
																	<th className="px-3 py-2 text-left text-sm font-medium">
																		Процент
																	</th>
																</tr>
															</thead>
															<tbody>
																{method.components.map((component, idx) => (
																	<tr key={idx}>
																		<td className="px-3 py-2 text-sm border-b">
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
																		<td className="px-3 py-2 text-sm border-b">
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
											<p className="text-gray-700">
												{"content" in review ? review.content : "Нема содржина"}
											</p>
										</div>
									)}
								</div>
							)}
						</div>
					))
				)}

				{/* Load More Button */}
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

export default AdminDashboard;
