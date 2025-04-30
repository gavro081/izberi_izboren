import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CourseCatalog from "./components/SubjectCatalog/SubjectCatalog";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/register",
		element: <Register />,
	}
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
