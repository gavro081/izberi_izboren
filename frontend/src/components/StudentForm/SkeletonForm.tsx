const SkeletonForm = () => {
	return (
		<div className="space-y-6 max-w-4xl mx-auto animate-pulse">
			{/* Header */}
			<div className="h-8 bg-gray-200 rounded-md w-64 mx-auto" />

			{/* Index and Study Track */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{[1, 2].map((i) => (
					<div key={i}>
						<div className="h-6 bg-gray-200 rounded-md w-32 mb-2" />
						<div className="h-10 bg-gray-200 rounded-md w-full" />
					</div>
				))}
			</div>

			{/* Year */}
			<div>
				<div className="h-6 bg-gray-200 rounded-md w-40 mb-2" />
				<div className="h-10 bg-gray-200 rounded-md w-full" />
			</div>

			{/* Mandatory Subjects */}
			<div>
				<div className="h-6 bg-gray-200 rounded-md w-48 mb-4" />
				<div className="flex flex-wrap gap-2">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="h-10 bg-gray-200 rounded-md w-48" />
					))}
				</div>
			</div>

			{/* Elective Subjects */}
			<div>
				<div className="h-6 bg-gray-200 rounded-md w-48 mb-4" />
				<div className="flex flex-wrap gap-2">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="h-10 bg-gray-200 rounded-md w-48" />
					))}
				</div>
			</div>

			{/* Study Effort */}
			<div>
				<div className="h-6 bg-gray-200 rounded-md w-40 mb-4" />
				<div className="flex gap-2">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="h-10 bg-gray-200 rounded-md w-16" />
					))}
				</div>
			</div>

			{/* Interest Fields */}
			<div>
				<div className="h-6 bg-gray-200 rounded-md w-40 mb-4" />
				<div className="flex flex-wrap gap-2">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div key={i} className="h-10 bg-gray-200 rounded-md w-32" />
					))}
				</div>
			</div>

			{/* Technologies */}
			<div>
				<div className="h-6 bg-gray-200 rounded-md w-44 mb-4" />
				<div className="flex flex-wrap gap-2">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="h-10 bg-gray-200 rounded-md w-32" />
					))}
				</div>
			</div>

			{/* Evaluation */}
			<div>
				<div className="h-6 bg-gray-200 rounded-md w-52 mb-4" />
				<div className="flex flex-wrap gap-2">
					{[1, 2, 3].map((i) => (
						<div key={i} className="h-10 bg-gray-200 rounded-md w-36" />
					))}
				</div>
			</div>

			{/* Submit Button */}
			<div className="pt-4">
				<div className="h-12 bg-gray-200 rounded-md w-32" />
			</div>
		</div>
	);
};

export default SkeletonForm;
