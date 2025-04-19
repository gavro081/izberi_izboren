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
			setIsLoaded(true);
		};
		fetchData();
	}, []);
	return !isLoaded ? (
		<p>Loading...</p>
	) : (
		<>
			{data.slice(0, 10).map((item) => {
				return (
					<div>
						<ul>
							{subject_values.map((header) => {
								return Array.isArray(item[header]) ? (
									<li>
										{header}: {item[header].join(", ")}
									</li>
								) : (
									<li key={header}>
										{header}: {item[header]}
									</li>
								);
							})}
						</ul>
					</div>
				);
			})}
		</>
	);
}

export default Home;
