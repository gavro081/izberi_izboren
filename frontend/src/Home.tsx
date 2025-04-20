import { useEffect, useState } from "react";

type ValidHeader = Extract<keyof Subject, "name" | "code">;
const subject_values: ValidHeader[] = ["name", "code"];
// const subject_values: (keyof Subject)[] = ["name", "code"];

interface Subject {
	id: number;
	code: string;
	name: string;
	abstract: string;
	info: SubjectInfo;
}

interface SubjectInfo {
	level: number;
	short: string;
	prerequisite: string;
	activated: Boolean;
	participants: number[];
	mandatory: Boolean;
	mandatory_for: string[];
	semester: number;
	season: string;
	elective_for: string[];
	professors: string[];
	assistants: string[];
}

function Home() {
	const [data, setData] = useState<any[]>([]);
	const [extraData, setExtraData] = useState<SubjectInfo[]>([]);
	const [showData, setShowData] = useState<Boolean[]>([]);
	const [isLoaded, setIsLoaded] = useState(false);
	const [limit, setLimit] = useState(10);

	const toggleInfo = (index: number) => {
		console.log(extraData[index]);
		console.log(extraData);
		setShowData((prev) =>
			prev.map((value, i) => (i === index ? !value : value))
		);
		console.log(showData);
	};

	const renderData = (data: SubjectInfo) => {
		return Object.keys(data)
			.slice(1)
			.map((key) => {
				const typedKey = key as keyof SubjectInfo;
				const field = data[typedKey];
				return Array.isArray(field) ? (
					<p>
						{key}: {field.length === 0 ? "/" : field.join(", ")}
					</p>
				) : (
					<p>
						{key}: {field === "" ? "/" : field.toString()}
					</p>
				);
			});
	};

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch("http://localhost:8000/api");
			const data = await response.json();
			setData(data.rows);
			const object_data: SubjectInfo[] = data.rows.map((item: Subject) => {
				return item.info;
			});
			console.log(object_data);
			setExtraData(object_data);
			setShowData(Array(object_data.length).fill(false));
			setIsLoaded(true);
		};
		fetchData();
	}, []);
	return !isLoaded ? (
		<p>Loading...</p>
	) : (
		<div className="ml-2 flex-col">
			{data.slice(0, limit).map((item: Subject, index: number) => {
				return (
					<div
						key={item.code}
						className="p-5 rounded-md border flex gap-12
						border-black mt-1 bg-blue-200"
					>
						<div className="w-80">
							<p>Subject:</p>
							{subject_values.map((header) => {
								return (
									<p key={header}>
										{header}: {item[header]}
									</p>
								);
							})}
							<button
								onClick={() => toggleInfo(index)}
								className="rounded-md p-1.5 mt-1 bg-blue-500 text-sm text-white"
							>
								{showData[index] ? "hide " : "show "} info
							</button>
						</div>
						{showData[index] && (
							<div>
								<p>Subject info:</p>
								{renderData(extraData[index])}
							</div>
						)}
					</div>
				);
			})}
			<button
				className="rounded-md border p-3 my-3 bg-blue-500 text-white"
				onClick={() => setLimit(limit + 10)}
			>
				Load more
			</button>
			<button className="rounded-md border p-3 my-3 ml-3 bg-blue-500 text-white">
				Reset
			</button>
		</div>
	);
}

export default Home;
