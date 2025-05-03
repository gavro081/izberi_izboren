import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  console.log(isAuthenticated); // Log to check state changes

  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between">
      <div className="space-x-4">
        <Link to="/">Home</Link>
        <Link to="/subjects">Subjects</Link>
        {isAuthenticated && <Link to="/account">Account</Link>}
      </div>

      <div>
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded"
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="mr-3">
              Login
            </Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
