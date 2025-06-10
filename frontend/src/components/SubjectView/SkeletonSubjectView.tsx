function SkeletonSubjectView() {
	return (
		<div className="min-h-screen bg-gray-50">
			<div className="bg-white shadow-s mb-5 py-4">
				<div className="max-w-6xl mx-auto px-4 py-1.5 skeleton-pulse mb-4">
					<div className="flex items-center text-gray-300 mb-4">
						<div className="w-5 h-5 bg-gray-200 rounded mr-2" />
						<div className="h-4 w-32 bg-gray-200 rounded" />
					</div>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<div>
							<div className="h-8 w-80 bg-gray-200 rounded mb-2" />
							<div className="h-5 w-24 bg-gray-200 rounded" />
						</div>
					</div>
				</div>
			</div>
			<div className="max-w-6xl mx-auto px-4 py-8 bg-gray-50">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-8">
						<div className="bg-white rounded-lg shadow-sm p-6 skeleton-pulse">
							<div className="h-6 w-40 bg-gray-200 rounded mb-4" />
							<div className="space-y-2">
								<div className="h-4 w-full bg-gray-200 rounded" />
								<div className="h-4 w-5/6 bg-gray-200 rounded" />
								<div className="h-4 w-2/3 bg-gray-200 rounded" />
							</div>
						</div>
						<div className="bg-white rounded-lg shadow-sm p-6 skeleton-pulse">
							<div className="h-6 w-40 bg-gray-200 rounded mb-6" />
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<div className="h-4 w-32 bg-gray-200 rounded" />
									<div className="h-4 w-24 bg-gray-200 rounded" />
								</div>
								<div className="space-y-2">
									<div className="h-4 w-32 bg-gray-200 rounded" />
									<div className="h-4 w-24 bg-gray-200 rounded" />
								</div>
							</div>
						</div>
						<div className="bg-white rounded-lg shadow-sm p-6 skeleton-pulse">
							<div className="h-6 w-40 bg-gray-200 rounded mb-4" />
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<div className="h-4 w-32 bg-gray-200 rounded" />
									<div className="h-4 w-24 bg-gray-200 rounded" />
								</div>
								<div className="space-y-2">
									<div className="h-4 w-32 bg-gray-200 rounded" />
									<div className="h-4 w-24 bg-gray-200 rounded" />
								</div>
							</div>
						</div>
						<div className="bg-white rounded-lg shadow-sm p-6 skeleton-pulse">
							<div className="h-6 w-32 bg-gray-200 rounded mb-4" />
							<div className="flex flex-wrap gap-3">
								<div className="h-6 w-16 bg-gray-200 rounded-full" />
								<div className="h-6 w-20 bg-gray-200 rounded-full" />
								<div className="h-6 w-12 bg-gray-200 rounded-full" />
							</div>
						</div>
					</div>

					<div className="space-y-6">
						<div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
							<div className="h-6 w-32 bg-gray-200 rounded mb-6" />
							<div className="h-4 w-24 bg-gray-200 rounded" />
							<div className="h-4 w-16 bg-gray-200 rounded" />
							<div className="h-4 w-20 bg-gray-200 rounded" />
							<div className="h-4 w-28 bg-gray-200 rounded" />
							<div className="h-4 w-24 bg-gray-200 rounded" />
						</div>
						<div className="bg-white rounded-lg shadow-sm p-6">
							<div className="h-6 w-32 bg-gray-200 rounded mb-4" />
							<div className="h-4 w-40 bg-gray-200 rounded" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SkeletonSubjectView;
