import { useState } from "react";
import { Subject } from "../components/types";
import { useAuth } from "../hooks/useAuth";

const Recommendations = () => {
	const { accessToken } = useAuth();
	const [recommendations, setRecommendations] = useState<Subject[]>([]);
	const testAPI = async () => {
		const start = performance.now();
		console.log("fetching...");
		fetch("http://localhost:8000/suggestion/", {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data.data);
				setRecommendations(data.data);
				console.log((performance.now() - start) / 1000);
			});
	};

	return (
		<div className="ml-2">
			<p>zdravo klikni na kopcevo besplatno e</p>
			<button className="bg-red-500 p-2 rounded" onClick={testAPI}>
				test api
			</button>
			<div>
				{recommendations &&
					recommendations.map((subject) => (
						<div>
							<p>{subject.name}</p>
						</div>
					))}
			</div>
		</div>
	);
};

export default Recommendations;
