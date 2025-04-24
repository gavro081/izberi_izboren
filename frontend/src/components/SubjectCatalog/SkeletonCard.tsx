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
export default SkeletonCard;
