import { useState } from "react";
import { Subject } from "../components/types";
import useAxiosAuth from "../hooks/useAxiosAuth";

const Recommendations = () => {
	const axiosAuth  = useAxiosAuth();
	const [recommendations, setRecommendations] = useState<Subject[]>([]);
	const testAPI = async () => {
		try {
			const response = await axiosAuth.get("/suggestion");
			setRecommendations(response.data.data);
		}
		catch (error) {
			console.error("Error fetching recommendations:", error);
		}
	};

	return (
		<div className="ml-2">
			<p>zdravo klikni na kopcevo besplatno e</p>
			<button className="bg-red-500 p-2 rounded" onClick={testAPI}>
				test api
			</button>
			<div>
				{recommendations &&
					Object.entries(recommendations).map(([key, value]) => (
						<div key={key}>
							<p>
								<strong>{key}:</strong> {String(value)}
							</p>
						</div>
					))}
			</div>
		</div>
	);
};

export default Recommendations;
