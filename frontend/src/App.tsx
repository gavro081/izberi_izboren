import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import ScrollToTop from "./components/ScrollToTop";
import CourseCatalog from "./components/SubjectCatalog/SubjectCatalog";
import { AuthProvider } from "./context/AuthProvider";
import "./index.css";
import Account from "./pages/Account";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Recommendations from "./pages/Recommendations";
import Register from "./pages/Register";
import ReviewForm from "./pages/ReviewForm";
import Reviews from "./pages/Reviews";
import SubjectPreferences from "./pages/SubjectPreferences";
import SubjectView from "./pages/SubjectView";

const Layout = () => (
	<div className="flex flex-col min-h-screen">
		<ScrollToTop />
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
					<PrivateRoute allowedUserTypes={["student"]}>
						<Recommendations />
					</PrivateRoute>
				),
			},
			{
				path: "account",
				element: (
					<PrivateRoute allowedUserTypes={["student"]}>
						<Account />
					</PrivateRoute>
				),
			},
			{
				path: "subject-preferences",
				element: (
					<PrivateRoute allowedUserTypes={["student"]}>
						<SubjectPreferences />
					</PrivateRoute>
				),
			},
			{
				path: "subjects/:code",
				element: <SubjectView />,
			},
			{
				path: "review-form/:code",
				element: (
					<PrivateRoute allowedUserTypes={["student"]}>
						<ReviewForm />
					</PrivateRoute>
				),
			},
			{
				path: "reviews",
				element: (
					<PrivateRoute allowedUserTypes={["student", "admin"]}>
						<Reviews />
					</PrivateRoute>
				),
			},
			{
				path: "*",
				element: <NotFound />,
			},
		],
	},
]);

function App() {
	return (
		<AuthProvider>
			<RouterProvider router={router} />
		</AuthProvider>
	);
}

export default App;
