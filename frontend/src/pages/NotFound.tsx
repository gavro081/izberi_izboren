import { Link } from "react-router-dom";

const NotFound = () => {
	return (
		<div className="flex flex-col items-center justify-center min-h-[83vh] bg-white text-gray-800">
			<h1 className="text-6xl font-bold mb-4">404</h1>
			<h2 className="text-2xl font-semibold mb-2">Страната не постои</h2>
			<p className="mb-6 text-center max-w-md">
				Страната која ја бараш не постои или била преместена.
			</p>
			<Link
				to="/"
				className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
			>
				Домашна страна
			</Link>
		</div>
	);
};

export default NotFound;
