import { useEffect, useState } from "react";

const subject_values = ["id", "name", "code"];

function Home() {
	const [data, setData] = useState<any[]>([]);
	const [isLoaded, setIsLoaded] = useState(false);
	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch("http://localhost:8000/api");
			const data = await response.json();
			setData(data.rows);
			console.log(data.rows);
			setIsLoaded(true);
		};
		fetchData();
	}, []);
	return !isLoaded ? (
		<p>Loading...</p>
	) : (
		<div>
			{data.slice(0, 10).map((item) => {
				return (
					<div key={item.id} className="rounded-md border border-black mt-1">
						{subject_values.map((header) => {
							return Array.isArray(item[header]) ? (
								<p key={header}>
									{header}: {item[header].join(", ")}
								</p>
							) : (
								<p key={header}>
									{header}: {item[header]}
								</p>
							);
						})}
					</div>
				);
			})}
		</div>
	);
}

export default Home;
