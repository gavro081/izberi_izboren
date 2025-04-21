import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CourseCatalog from "./components/SubjectCatalog";
import "./index.css";
import Home from "./pages/Home";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Home />,
	},
	{
		path: "/test",
		element: <CourseCatalog />,
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
