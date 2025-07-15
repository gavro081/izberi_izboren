import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { EvaluationComponent, EvaluationMethod } from "../components/types";

const COMPONENT_CATEGORIES = [
	{ value: "project", label: "Проект" },
	{ value: "theory", label: "Теорија" },
	{ value: "practical", label: "Практично" },
	{ value: "homework", label: "Домашни задачи" },
	{ value: "labs", label: "Лабораториски" },
	{ value: "presentation", label: "Презентација" },
	{ value: "attendance", label: "Присуство" },
];

const OTHER_REVIEW_CATEGORIES = [
	{ value: "material", label: "Материјали" },
	{ value: "staff", label: "Наставен кадар" },
	{ value: "other", label: "Останато" },
];

const ReviewForm = () => {
	const [reviewType, setReviewType] = useState<"evaluation" | "other" | "">("");
	const [error, setError] = useState<string>("");
	const [methods, setMethods] = useState<EvaluationMethod[]>([
		{
			note: "",
			components: [{ category: "project", percentage: 100 }],
		},
	]);
	const [signatureCondition, setSignatureCondition] = useState("");
	const [signatureType, setSignatureType] = useState<
		"none" | "points" | "attendance"
	>("none");
	const [signatureRequiredAmount, setSignatureRequiredAmount] = useState("");
	const [signatureMaxAmount, setSignatureMaxAmount] = useState("");
	const [otherCategory, setOtherCategory] = useState<
		"material" | "staff" | "other"
	>("material");
	const [otherContent, setOtherContent] = useState("");
	const navigate = useNavigate();
	const location = useLocation();
	const subjectName: string = location?.state?.subject_name;
	const subjectId: number = location?.state?.subject_id;
	// const { code } = useParams();

	const addMethod = () => {
		if (methods.length < 3) {
			setMethods([
				...methods,
				{
					note: "",
					components: [{ category: "project", percentage: 100 }],
				},
			]);
		}
	};

	const removeMethod = (methodIndex: number) => {
		if (methods.length > 1) {
			setMethods(methods.filter((_, index) => index !== methodIndex));
		}
	};

	const updateMethodNote = (methodIndex: number, note: string) => {
		const updatedMethods = [...methods];
		updatedMethods[methodIndex].note = note;
		setMethods(updatedMethods);
	};

	const addComponent = (methodIndex: number) => {
		const updatedMethods = [...methods];
		updatedMethods[methodIndex].components.push({
			category: "project",
			percentage: 0,
		});
		setMethods(updatedMethods);
	};

	const removeComponent = (methodIndex: number, componentIndex: number) => {
		const updatedMethods = [...methods];
		if (updatedMethods[methodIndex].components.length > 1) {
			updatedMethods[methodIndex].components.splice(componentIndex, 1);
			setMethods(updatedMethods);
		}
	};

	const updateComponent = (
		methodIndex: number,
		componentIndex: number,
		field: keyof EvaluationComponent,
		value: string | number
	) => {
		const updatedMethods = [...methods];
		updatedMethods[methodIndex].components[componentIndex] = {
			...updatedMethods[methodIndex].components[componentIndex],
			[field]: value,
		};
		setMethods(updatedMethods);
	};

	const getMethodPercentageTotal = (method: EvaluationMethod): number => {
		return method.components.reduce(
			(sum, component) => sum + (component.percentage || 0),
			0
		);
	};

	const isMethodValid = (method: EvaluationMethod): boolean => {
		const categories = method.components.map((c) => c.category);
		const uniqueCategories = new Set(categories);
		return (
			getMethodPercentageTotal(method) === 100 &&
			uniqueCategories.size === categories.length
		);
	};

	const areAllMethodsValid = (): boolean => {
		return methods.every(isMethodValid);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (Number(signatureMaxAmount) < Number(signatureRequiredAmount)) {
			alert(1);
			setError("Провери услов за потпис");
			return;
		}

		if (reviewType === "evaluation" && !areAllMethodsValid()) {
			setError("Сумата на сите проценти за секој метод мора да биде 100%");
			return;
		}

		if (reviewType === "evaluation" && signatureType !== "none") {
			if (!signatureRequiredAmount || !signatureMaxAmount) {
				setError(
					"Ве молиме внесете ги сите потребни вредности за условот за потпис"
				);
				return;
			}
		}

		if (reviewType === "other") {
			if (!otherCategory) {
				setError("Мора да изберете категорија");
				return;
			}
			if (!otherContent.trim()) {
				setError("Содржината не може да биде празна");
				return;
			}

			if (otherContent.trim().length > 700) {
				setError("Содржината не може да биде подолга од 700 карактери");
				return;
			}

			try {
				await axiosInstance.post("/subjects/subject-review/", {
					subject_id: subjectId,
					type: "other",
					category: otherCategory,
					content: otherContent.trim(),
				});
				navigate(-1);
				// TODO: maybe add message for successful post
			} catch (err) {
				console.error(err);
				setError("Грешка при зачувување");
			}
			return;
		}

		// post specific for evaluation reviews
		try {
			await axiosInstance.post("/subjects/subject-review/", {
				subject_id: subjectId,
				type: "evaluation",
				methods: methods,
				signature_condition: signatureCondition,
			});
			navigate(-1);
			// TODO: maybe add message for successful post
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
			<h2 className="text-2xl font-bold mb-6">Сподели информација</h2>

			{subjectName && (
				<div className="mb-6 p-4 bg-blue-50 rounded-lg">
					<p className="text-blue-800">
						Додавате информација за предмет:{" "}
						<span className="font-semibold">{subjectName}</span>
					</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-3">
						Тип
					</label>
					<div className="flex space-x-4">
						<label className="flex items-center">
							<input
								type="radio"
								name="reviewType"
								value="evaluation"
								checked={reviewType === "evaluation"}
								onChange={(e) => setReviewType(e.target.value as "evaluation")}
								className="mr-2"
							/>
							Информации за полагање
						</label>
						<label className="flex items-center">
							<input
								type="radio"
								name="reviewType"
								value="other"
								checked={reviewType === "other"}
								onChange={(e) => setReviewType(e.target.value as "other")}
								className="mr-2"
							/>
							Други информации
						</label>
					</div>
				</div>

				{/* evaluation */}
				{reviewType === "evaluation" && (
					<div className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Услов за потпис
							</label>
							<select
								value={signatureType}
								onChange={(e) => {
									const newType = e.target.value as
										| "none"
										| "points"
										| "attendance";
									setSignatureType(newType);
									if (newType === "none") {
										setSignatureCondition("Нема");
									} else {
										setSignatureCondition("");
									}
									setSignatureRequiredAmount("");
									setSignatureMaxAmount("");
								}}
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 custom-select mb-3"
							>
								<option value="none">Нема услов за потпис</option>
								<option value="points">Поени на лабораториски вежби</option>
								<option value="attendance">
									Присуство на лабораториски вежби
								</option>
							</select>

							{signatureType === "points" && (
								<div className="flex items-center space-x-2">
									<input
										type="number"
										value={signatureRequiredAmount}
										onChange={(e) => {
											setSignatureRequiredAmount(e.target.value);
											if (e.target.value && signatureMaxAmount) {
												setSignatureCondition(
													`${e.target.value}/${signatureMaxAmount} поени на лабораториски`
												);
											}
										}}
										placeholder="Потребни поени"
										className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										required
									/>
									<span className="text-gray-500">/</span>
									<input
										type="number"
										value={signatureMaxAmount}
										onChange={(e) => {
											setSignatureMaxAmount(e.target.value);
											if (signatureRequiredAmount && e.target.value) {
												setSignatureCondition(
													`${signatureRequiredAmount}/${e.target.value} поени на лабораториски`
												);
											}
										}}
										placeholder="Максимални поени"
										className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										required
									/>
									{/* <span className="text-sm text-gray-500">поени</span> */}
								</div>
							)}

							{signatureType === "attendance" && (
								<div className="flex items-center space-x-2">
									<input
										type="number"
										value={signatureRequiredAmount}
										onChange={(e) => {
											setSignatureRequiredAmount(e.target.value);
											if (e.target.value && signatureMaxAmount) {
												setSignatureCondition(
													`${e.target.value}/${signatureMaxAmount} присуство на лабораториски`
												);
											}
										}}
										placeholder="Потребно присуство"
										className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										required
									/>
									<span className="text-gray-500">/</span>
									<input
										type="number"
										value={signatureMaxAmount}
										onChange={(e) => {
											setSignatureMaxAmount(e.target.value);
											if (signatureRequiredAmount && e.target.value) {
												setSignatureCondition(
													`${signatureRequiredAmount}/${e.target.value} присуство на лабораториски`
												);
											}
										}}
										placeholder="Вкупно лабораториски вежби"
										className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										required
									/>
								</div>
							)}
						</div>

						<div>
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-medium text-gray-900">
									Начини на оценување ({methods.length}/3)
								</h3>
								{methods.length < 3 && (
									<button
										type="button"
										onClick={addMethod}
										className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
									>
										<Plus className="w-4 h-4 mr-1" />
										Додај метод
									</button>
								)}
							</div>

							{methods.map((method, methodIndex) => (
								<div
									key={methodIndex}
									className="border border-gray-200 rounded-lg p-4 mb-4"
								>
									<div className="flex items-center justify-between mb-4">
										<h4 className="font-medium text-gray-900">
											Метод {methodIndex + 1}
										</h4>
										{methods.length > 1 && (
											<button
												type="button"
												onClick={() => removeMethod(methodIndex)}
												className="text-red-600 hover:text-red-800"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										)}
									</div>

									<div className="mb-4">
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Наслов / коментар / забелешка .... (опционално)
										</label>
										<input
											type="text"
											value={method.note || ""}
											onChange={(e) =>
												updateMethodNote(methodIndex, e.target.value)
											}
											placeholder="Дополнителни информации за овој метод"
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>

									<div>
										<div className="flex items-center justify-between mb-3">
											<label className="block text-sm font-medium text-gray-700">
												Компоненти на оценување
											</label>
											<button
												type="button"
												onClick={() => addComponent(methodIndex)}
												className="flex items-center px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
											>
												<Plus className="w-3 h-3 mr-1" />
												Додај компонента
											</button>
										</div>

										{method.components.map((component, componentIndex) => (
											<div
												key={componentIndex}
												className="flex items-center space-x-3 mb-3"
											>
												<select
													value={component.category}
													onChange={(e) =>
														updateComponent(
															methodIndex,
															componentIndex,
															"category",
															e.target.value
														)
													}
													className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 custom-select"
												>
													{COMPONENT_CATEGORIES.map((cat) => (
														<option key={cat.value} value={cat.value}>
															{cat.label}
														</option>
													))}
												</select>

												<div className="flex items-center space-x-2">
													<input
														type="number"
														min="0"
														max="100"
														value={component.percentage || ""}
														onChange={(e) =>
															updateComponent(
																methodIndex,
																componentIndex,
																"percentage",
																parseInt(e.target.value) || 0
															)
														}
														className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
													/>
													<span className="text-sm text-gray-500">%</span>
												</div>

												{method.components.length > 1 && (
													<button
														type="button"
														onClick={() =>
															removeComponent(methodIndex, componentIndex)
														}
														className="text-red-600 hover:text-red-800"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												)}
											</div>
										))}

										<div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
											<div className="flex items-center space-x-2">
												<span className="text-sm text-gray-600">
													Вкупно: {getMethodPercentageTotal(method)}%
												</span>
												{!isMethodValid(method) && (
													<div className="flex items-center text-red-600">
														<AlertCircle className="w-4 h-4 mr-1" />
														<span className="text-sm">
															Мора да биде 100% и сите компоненти да се
															различни.
														</span>
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{reviewType === "other" && (
					<div className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Тема
							</label>
							<select
								value={otherCategory}
								onChange={(e) =>
									setOtherCategory(
										e.target.value as "material" | "staff" | "other"
									)
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 custom-select"
							>
								{OTHER_REVIEW_CATEGORIES.map((category) => (
									<option key={category.value} value={category.value}>
										{category.label}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Содржина
							</label>
							<textarea
								value={otherContent}
								onChange={(e) => setOtherContent(e.target.value)}
								placeholder="Опишете го вашето искуство или мислење за предметот..."
								rows={6}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
								required
							/>
							<div className="flex justify-between items-center mt-1">
								<p className="text-sm text-gray-500">
									Споделете корисни информации за други студенти
								</p>
								<p
									className={`text-sm ${
										otherContent.length > 700 ? "text-red-600" : "text-gray-500"
									}`}
								>
									{otherContent.length}/700 карактери
								</p>
							</div>
						</div>
					</div>
				)}

				{/* error */}
				{error && (
					<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
						<div className="flex items-center">
							<AlertCircle className="w-5 h-5 text-red-600 mr-2" />
							<p className="text-red-800">{error}</p>
						</div>
					</div>
				)}

				{reviewType && (
					<div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
						<button
							type="submit"
							disabled={
								(reviewType === "evaluation" && !areAllMethodsValid()) ||
								(reviewType === "evaluation" &&
									signatureType !== "none" &&
									(!signatureRequiredAmount || !signatureMaxAmount))
							}
							className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
						>
							Објави
						</button>
					</div>
				)}
			</form>
		</div>
	);
};

export default ReviewForm;
