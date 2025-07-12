import { EVALUATION_MAP_TO_MK } from "../../constants/subjects";
import { Reviews } from "../types";
import Votes from "./Votes";

interface EvaluationReviewsProps {
	reviews: Reviews;
}

const EvaluationReviews = ({ reviews }: EvaluationReviewsProps) => {
	return (
		<>
			{reviews.evaluation?.methods?.length > 0 && (
				<div className="mb-8">
					<h3 className="text-lg font-medium mb-4 text-gray-900">
						Информации за полагање
					</h3>
					<div className="space-y-4">
						{reviews &&
							reviews.evaluation &&
							(reviews.evaluation?.methods?.length > 0 ? (
								<div className="border border-gray-200 rounded-lg p-4">
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center space-x-2">
											<span className="text-sm text-gray-600">
												Индекс: {reviews.evaluation?.review.student}
											</span>
											{reviews.evaluation?.review.is_confirmed ? (
												<div className="flex items-center text-green-600">
													{/* <CheckCircle className="w-4 h-4 mr-1" /> */}
													<span className="text-sm">Потврдено</span>
												</div>
											) : (
												<div className="flex items-center text-red-600 group relative cursor-help">
													<span className="text-sm border-red-600 border-b border-dotted">
														Непотврдено
													</span>
													<div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-10 hidden group-hover:block bg-white text-gray-800 text-xs rounded shadow-lg px-3 py-2 w-48 border border-gray-200">
														Администратор сè уште не ја потврдил точноста на
														оваа информација.
													</div>
												</div>
											)}
										</div>
										<Votes reviews={reviews} />
									</div>
									{reviews.evaluation?.methods?.map((method, index) => (
										<div key={index}>
											<div className="space-y-4 mb-3">
												<div>
													<p className="text-sm text-gray-600 mb-2 font-semibold">
														Начин на оценување {index + 1}:
													</p>
													<div className="overflow-x-auto">
														<table className="min-w-full border border-gray-300">
															<thead className="bg-gray-50">
																<tr>
																	<th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
																		Активност
																	</th>
																	<th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
																		Процент од оценка
																	</th>
																</tr>
															</thead>
															<tbody>
																{method.components.map((component, index) => (
																	<tr key={index}>
																		<td className="px-4 py-2 text-sm text-gray-900 border-b">
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
																		<td className="px-4 py-2 text-sm text-gray-900 border-b">
																			{component.percentage}%
																		</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
												</div>
											</div>
										</div>
									))}
									<p className="text-gray-800 font-semibold">
										Услов за потпис:{" "}
										<span>
											{reviews.evaluation.signature_condition &&
											reviews.evaluation.signature_condition != "None"
												? reviews.evaluation.signature_condition
												: "Нема"}
										</span>
									</p>
								</div>
							) : null)}
					</div>
				</div>
			)}
		</>
	);
};

export default EvaluationReviews;
