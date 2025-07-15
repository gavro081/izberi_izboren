import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import IOimage from "../assets/IOLogo.png";
import { usePreferences } from "../context/PreferencesContext";
import { useRecommendations } from "../context/RecommendationsContext";
import { useAuth } from "../hooks/useAuth";

const Navbar: React.FC = () => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [profileMenuOpen, setProfileMenuOpen] = useState(false);
	const [, setRecommendations] = useRecommendations();
	const { isAuthenticated, logout, user } = useAuth();
	const { setFavoriteIds, setLikedIds, setDislikedIds } = usePreferences();
	const navigate = useNavigate();
	const profileMenuRef = useRef<HTMLDivElement>(null);
	const userInitial = user?.full_name?.charAt(0).toUpperCase() || "";
	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				profileMenuRef.current &&
				!profileMenuRef.current.contains(event.target as Node)
			) {
				setProfileMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleLogout = () => {
		logout();
		setRecommendations([]);
		setFavoriteIds(new Set());
		setLikedIds(new Set());
		setDislikedIds(new Set());
		navigate("/");
		toast.success("Успешно сте одјавени!");
	};

	// const testAccountLogin = async () => {
	// 	if (isAuthenticated) return;
	// 	try {
	// 		const response = await axios.post("http://localhost:8000/auth/login/", {
	// 			email: "fffff@finki.ukim.mk",
	// 			password: "testTestTEST123",
	// 		});
	// 		const { access, refresh, full_name, user_type } = response.data;
	// 		login(access, refresh, {
	// 			full_name,
	// 			user_type,
	// 		});
	// 		navigate("/");
	// 	} catch (err: unknown) {
	// 		console.log(err);
	// 	}
	// };

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

				{/* Desktop Menu */}
				<div className="hidden sm:flex space-x-4 items-center text-sm sm:text-base">
					{/* <button onClick={testAccountLogin}>quick login</button> */}
					<Link to="/subjects" className="hover:underline">
						Сите предмети
					</Link>
					{isAuthenticated && user?.user_type === "student" && (
						<Link to="/reviews" className="hover:underline">
							Информации од студенти
						</Link>
					)}
					{isAuthenticated && user?.user_type === "admin" && (
						<Link to="/reviews" className="hover:underline">
							Админ панел
						</Link>
					)}
					{isAuthenticated && user?.user_type === "student" && (
						<Link
							to="/recommendations"
							className="hover:underline"
							onClick={() => setProfileMenuOpen(false)}
						>
							Препораки
						</Link>
					)}
					{isAuthenticated ? (
						<div className="relative" ref={profileMenuRef}>
							<button
								onClick={() => setProfileMenuOpen(!profileMenuOpen)}
								className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center font-bold text-xl hover:bg-blue-700 transition"
							>
								{userInitial}
							</button>
							{profileMenuOpen && (
								<div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 text-black z-20">
									{user?.user_type === "admin" ? (
										<>
											<button
												onClick={() => {
													handleLogout();
													setProfileMenuOpen(false);
												}}
												className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:underline"
											>
												Одјави се
											</button>
										</>
									) : (
										<>
											<Link
												to="/account"
												className="block px-4 py-2 text-sm hover:bg-gray-100 hover:underline"
												onClick={() => setProfileMenuOpen(false)}
											>
												Профил
											</Link>

											<Link
												to="/recommendations"
												className="block px-4 py-2 text-sm hover:bg-gray-100 hover:underline"
												onClick={() => setProfileMenuOpen(false)}
											>
												Препораки
											</Link>
											<Link
												to="/subject-preferences"
												className="block px-4 py-2 text-sm hover:bg-gray-100 hover:underline"
												onClick={() => setMenuOpen(false)}
											>
												Мои предмети
											</Link>

											<button
												onClick={() => {
													handleLogout();
													setProfileMenuOpen(false);
												}}
												className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:underline"
											>
												Одјави се
											</button>
										</>
									)}
								</div>
							)}
						</div>
					) : (
						<Link to="/login" className="hover:underline">
							Најави се
						</Link>
					)}
				</div>
			</div>

			{/* Mobile Menu */}
			{menuOpen && (
				<div className="sm:hidden mt-3 flex flex-col space-y-2 text-sm">
					<Link
						to="/subjects"
						className="hover:underline"
						onClick={() => setMenuOpen(false)}
					>
						Предмети
					</Link>
					{isAuthenticated && (
						<>
							{user?.user_type === "admin" ? (
								<>
									<Link
										to="/reviews"
										className="hover:underline"
										onClick={() => setMenuOpen(false)}
									>
										Админ панел
									</Link>
									<button
										onClick={() => {
											handleLogout();
											setMenuOpen(false);
										}}
										className="text-left text-red-400 hover:underline"
									>
										Одјави се
									</button>
								</>
							) : (
								<>
									<Link
										to="/reviews"
										className="hover:underline"
										onClick={() => setMenuOpen(false)}
									>
										Информации од студенти
									</Link>
									<Link
										to="/recommendations"
										className="hover:underline"
										onClick={() => setMenuOpen(false)}
									>
										Препораки
									</Link>
									<Link
										to="/account"
										className="hover:underline"
										onClick={() => setMenuOpen(false)}
									>
										Профил
									</Link>
									<Link
										to="/subject-preferences"
										className="hover:underline"
										onClick={() => setMenuOpen(false)}
									>
										Омилени предмети
									</Link>
									<button
										onClick={() => {
											handleLogout();
											setMenuOpen(false);
										}}
										className="text-left text-red-400 hover:underline"
									>
										Одјави се
									</button>
								</>
							)}
						</>
					)}
					{!isAuthenticated && (
						<Link to="/login" onClick={() => setMenuOpen(false)}>
							Најави се
						</Link>
					)}
				</div>
			)}
		</nav>
	);
};

export default Navbar;
