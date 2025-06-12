import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import CourseCatalog from "./components/SubjectCatalog/SubjectCatalog";
import useAxiosAuth from "./hooks/useAxiosAuth";
import "./index.css";
import Account from "./pages/Account";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Recommendations from "./pages/Recommendations";
import Register from "./pages/Register";
import SubjectView from "./pages/SubjectView";

const Layout = () => (
	<div className="flex flex-col min-h-screen">
		<Navbar />
		<ToastContainer
			className="custom-toast-container"
			position="top-right"
			autoClose={2000}
			hideProgressBar={false}
			newestOnTop={false}
			closeOnClick
			rtl={false}
			pauseOnFocusLoss
			draggable
			pauseOnHover
			theme="light"
		/>
		<main className="flex-grow">
			<Outlet />
		</main>
		<Footer />
	</div>
);
const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{ path: "", element: <Home /> },
			{ path: "subjects", element: <CourseCatalog /> },
			{ path: "login", element: <Login /> },
			{ path: "register", element: <Register /> },
			{
				path: "recommendations",
				element: (
					<PrivateRoute>
						<Recommendations />
					</PrivateRoute>
				),
			},
			{
				path: "account",
				element: (
					<PrivateRoute>
						<Account />
					</PrivateRoute>
				),
			},
			{
				path: "subjects/:code",
				element: <SubjectView />,
			},
		],
	},
]);

function App() {
	useAxiosAuth();
	return <RouterProvider router={router} />;
}

export default App;
