import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import CourseCatalog from "./components/SubjectCatalog/SubjectCatalog";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Form from "./pages/Form";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./index.css";

const Layout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
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
        path: "form",
        element: (
          <PrivateRoute>
            <Form />
          </PrivateRoute>
        ),
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
