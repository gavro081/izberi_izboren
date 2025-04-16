import { useEffect, useState } from "react";

function App() {
	const [data, setData] = useState("");
	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch("http://localhost:8000/api");
			const data = await response.json();
			console.log(data);
			setData(data.message);
		};
		fetchData();
	}, []);

	return <>{data == "" ? <p>Loading....</p> : <p>{data}</p>}</>;
}

export default App;
