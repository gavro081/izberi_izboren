const SkeletonForm = () => {
	return (
		<div className="space-y-6 max-w-4xl mx-auto animate-pulse">
			{/* Header */}
			<div className="h-8 bg-gray-200 rounded-md w-64 mx-auto mb-4" />

			{/* Index and Study Track */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<div className="h-6 bg-gray-200 rounded-md w-32 mb-2" />
					<div className="h-10 bg-gray-200 rounded-md w-full" />
				</div>
				<div>
					<div className="h-6 bg-gray-200 rounded-md w-32 mb-2" />
					<div className="h-10 bg-gray-200 rounded-md w-full" />
				</div>
			</div>

			{/* Year */}
			<div>
				<div className="h-6 bg-gray-200 rounded-md w-40 mb-2" />
				<div className="h-10 bg-gray-200 rounded-md w-full" />
			</div>

			{/* Subjects Selector (Semesters grid) */}
			<div>
				<div className="h-6 bg-gray-200 rounded-md w-56 mb-4" />
				<div className="grid grid-cols-1 gap-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3"
						>
							<div className="h-5 bg-gray-200 rounded-md w-32 mb-2" />
							<div>
								<div className="h-4 bg-gray-200 rounded-md w-28 mb-2" />
								<div className="flex flex-wrap gap-2 mb-2">
									{Array.from({ length: 2 }).map((_, j) => (
										<div key={j} className="h-8 bg-gray-200 rounded-md w-28" />
									))}
								</div>
							</div>
							<div>
								<div className="h-4 bg-gray-200 rounded-md w-32 mb-2" />
								<div className="h-8 bg-gray-200 rounded-md w-full mb-2" />{" "}
								{/* search input */}
								<div className="flex flex-wrap gap-2 mb-2">
									{Array.from({ length: 3 }).map((_, k) => (
										<div key={k} className="h-8 bg-gray-200 rounded-md w-28" />
									))}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Extracurricular checkbox */}
			<div>
				<div className="h-5 bg-gray-200 rounded-md w-80 mb-2" />
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

			{/* Favorite Professors */}
			<div>
				<div className="h-6 bg-gray-200 rounded-md w-56 mb-4" />
				<div className="h-10 bg-gray-200 rounded-md w-60 mb-2" />{" "}
				{/* search input */}
				<div className="flex flex-wrap gap-2">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="h-10 bg-gray-200 rounded-md w-32" />
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
