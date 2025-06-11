import { ArrowRight, BookOpen, Lightbulb, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Homepage() {
	const { isAuthenticated } = useAuth();
	return (
		<div className="min-h-screen bg-white">
			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				<div className="text-center mb-16 bg-gray-50 rounded-xl border border-gray-200 shadow-md py-10 px-6">
					<h2 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">
						Најди го изборниот предмет за тебе
					</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						ИзбериИзборен е веб апликација која помага на студентите на ФИНКИ да
						се запознаат со изборните предмети кои ги нуди факултетот и да им
						помогне да го изберат најдобриот.
					</p>
				</div>

				<section className="p-8 shadow-md mb-8 bg-gray-50 rounded-xl border border-gray-200 ">
					<div className="flex items-start space-x-4">
						<div className="flex-shrink-0">
							<div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
								<Users className="h-6 w-6 text-red-600" />
							</div>
						</div>
						<div>
							<h3 className="text-xl font-semibold text-gray-900 mb-3">
								Зошто ИзбериИзборен?
							</h3>
							<p className="text-gray-600 leading-relaxed">
								Студентите на ФИНКИ се соочуваат со огромен избор при
								селекцијата на изборни предмети. Со многу достапни опции,
								ограничени описи на предметите и минимален увид во тоа што
								всушност се изучува, донесувањето информирана одлука е речиси
								невозможно. Многу студенти избираат на случаен избор или врз
								основа на нецелосни информации, што често доведува до
								разочарување и избирање нешто несоодветно за нив. Ова е
								проблемот којшто ние го решаваме.
							</p>
						</div>
					</div>
				</section>

				<section className="p-8 shadow-md mb-8 bg-gray-50 rounded-xl border border-gray-200 ">
					<div className="flex items-start space-x-4">
						<div className="flex-shrink-0">
							<div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
								<Lightbulb className="h-6 w-6 text-green-600" />
							</div>
						</div>
						<div className="flex-1">
							<h3 className="text-xl font-semibold text-gray-900 mb-3">
								Како работи нашиот алгоритам?
							</h3>
							<p className="text-gray-600 leading-relaxed mb-4">
								Нашиот систем ги анализира вашите положени предмети, интереси и
								преференци и ги споредува со деталните информации за сите
								достапни предмети што може да ги запишете. Секој релевантен
								фактор добива соодветна тежина при анализата. На крај, системот
								ги прикажува шесте најсоодветни предмети, подредени според
								нивната усогласеност со вашите параметри, почнувајќи од
								најпрепорачаниот.
							</p>

							{isAuthenticated ? (
								<Link
									to="/recommendations"
									onClick={() => window.scrollTo({ top: 0, behavior: "auto" })}
									className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-900 transition-colors font-medium"
								>
									Види препораки
									<ArrowRight className="h-4 w-4" />
								</Link>
							) : (
								<div className="bg-gray-100 rounded-lg p-4">
									<p className="text-gray-600 font-medium">
										<Link
											to="/login"
											onClick={() =>
												window.scrollTo({ top: 0, behavior: "auto" })
											}
											className="text-blue-600 hover:underline font-semibold"
										>
											Најавете се
										</Link>{" "}
										за да добиете персонализирани препораки и да го најдете
										најсоодветниот предмет за вас.
									</p>
								</div>
							)}
						</div>
					</div>
				</section>

				<section className=" p-8 shadow-md bg-gray-50 rounded-xl border border-gray-200">
					<div className="flex items-start space-x-4">
						<div className="flex-shrink-0">
							<div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
								<BookOpen className="h-6 w-6 text-blue-600" />
							</div>
						</div>
						<div className="flex-1">
							<h3 className="text-xl font-semibold text-gray-900 mb-3">
								База на сите предмети на ФИНКИ
							</h3>
							<p className="text-gray-600 leading-relaxed mb-4">
								Прелистајте ги сите предмети што факултетот моментално ги нуди.
								За секој предмет нудиме информации како што се начинот на
								полагање, изучуваните технологии, професорите и асистентите,
								предусловите и слично. Достапни се опции за пребарување и
								филтрирање за полесна и поефикасна навигација низ базата.
							</p>

							<Link
								to="/subjects"
								onClick={() => window.scrollTo({ top: 0, behavior: "auto" })}
								className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-900 transition-colors font-medium"
							>
								<span>Види предмети</span>
								<ArrowRight className="h-4 w-4" />
							</Link>
						</div>
					</div>
				</section>
			</main>

			{/* Footer
			<footer className="bg-white border-t border-gray-200 mt-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="text-center text-gray-600">
						<p>
							&copy; 2025 IzberiIzboren. Made for FINKI students, by FINKI
							students.
						</p>
					</div>
				</div>
			</footer> */}
		</div>
	);
}
