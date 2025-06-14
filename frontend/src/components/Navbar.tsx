import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import IOimage from "../assets/IOLogo.png";
import { useRecommendations } from "../context/RecommendationsContext";
import { useAuth } from "../hooks/useAuth";

const Navbar: React.FC = () => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [, setRecommendations] = useRecommendations();
	const { isAuthenticated, logout } = useAuth();
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleLogout = () => {
		logout();
		setRecommendations([]);
		navigate("/");
		toast.success("Успешно сте одјавени!");
	};

	const testAccountLogin = async () => {
		if (isAuthenticated) return;
		try {
			const response = await axios.post("http://localhost:8000/auth/login/", {
				email: "fffff@finki.ukim.mk",
				password: "testTestTEST123",
			});
			const { access, refresh } = response.data;
			login(access, refresh);
			navigate("/");
		} catch (err: unknown) {
			console.log(err);
		}
	};

	return (
		<nav className="bg-blue-600 text-white p-4">
			<div className="flex justify-between items-center">
				<div className="flex items-center space-x-4">
					<Link to="/">
						<img
							src={IOimage}
							alt="Дома"
							className="w-10 h-10 object-cover hover:scale-110 transition duration-300"
						/>
					</Link>
				</div>
				<button
					onClick={() => setMenuOpen(!menuOpen)}
					className="sm:hidden focus:outline-none"
				>
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						{menuOpen ? (
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						) : (
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M4 6h16M4 12h16M4 18h16"
							/>
						)}
					</svg>
				</button>

				<div className="hidden sm:flex space-x-4 items-center text-sm sm:text-base">
					<button onClick={testAccountLogin}>quick login</button>
					<Link to="/subjects" className="hover:underline">
						Предмети
					</Link>
					{isAuthenticated && (
						<Link to="/recommendations" className="hover:underline">
							Препораки
						</Link>
					)}
					{isAuthenticated && (
						<Link to="/account" className="hover:underline">
							Профил
						</Link>
					)}
					{isAuthenticated ? (
						<button
							onClick={handleLogout}
							className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
						>
							Одјави се
						</button>
					) : (
						<>
							<Link to="/login" className="hover:underline">
								Најави се
							</Link>
						</>
					)}
				</div>
			</div>

			{menuOpen && (
				<div className="sm:hidden mt-3 flex flex-col space-y-2 text-sm">
					<Link to="/subjects" className="hover:underline">
						Предмети
					</Link>
					{isAuthenticated && (
						<Link to="/account" className="hover:underline">
							Профил
						</Link>
					)}
					{isAuthenticated && (
						<Link to="/recommendations" className="hover:underline">
							Препораки
						</Link>
					)}
					{isAuthenticated ? (
						<button
							onClick={() => {
								handleLogout();
								setMenuOpen(false);
							}}
							className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
						>
							Одјави се
						</button>
					) : (
						<>
							<Link to="/login" onClick={() => setMenuOpen(false)}>
								Најави се
							</Link>
						</>
					)}
				</div>
			)}
		</nav>
	);
};

export default Navbar;
