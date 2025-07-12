import { MAP_REVIEW_CATEGORY_TO_MK } from "../SubjectCatalog/utils";
import { Reviews } from "../types";
import Votes from "./Votes";

interface OtherReviewsProps {
	reviews: Reviews;
}

const OtherReviews = ({ reviews }: OtherReviewsProps) => {
	return (
		<div>
			<h3 className="text-lg font-medium mb-4 text-gray-900">
				Останати информации
			</h3>

			<div className="space-y-4">
				{reviews.other.map((review) => (
					<div className="border border-gray-200 rounded-lg p-4">
						<div className="flex items-start justify-between mb-3">
							<div className="flex items-center space-x-2">
								<span className="text-sm text-gray-600">
									Индекс: {review.review.student}
								</span>
								<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
									{MAP_REVIEW_CATEGORY_TO_MK[review.category]}
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
											Администратор сè уште не ја потврдил точноста на оваа
											информација.
										</div>
									</div>
								)}
							</div>
							<Votes reviews={reviews} />
						</div>
						<p className="text-gray-700 text-sm">{review.content}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default OtherReviews;
