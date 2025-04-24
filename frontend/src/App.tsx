import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CourseCatalog from "./components/SubjectCatalog/SubjectCatalog";
import "./index.css";
import Home from "./pages/Home";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Home />,
	},
	{
		path: "/subjects",
		element: <CourseCatalog />,
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
