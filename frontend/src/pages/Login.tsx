import axios, { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import googleLogo from "../assets/google-logo.png";
import PasswordInput from "../components/PasswordInput";
import { UserType } from "../components/types";
import { useAuth } from "../hooks/useAuth";

interface LoginForm {
	email: string;
	password: string;
}

const Login: React.FC = () => {
	const [formData, setFormData] = useState<LoginForm>({
		email: "",
		password: "",
	});
	const [errors, setErrors] = useState<
		Partial<LoginForm> & { detail?: string[] }
	>({});
	const navigate = useNavigate();
	const { login, customGoogleLogin, googleLoginLoading, useOAuth } = useAuth();
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const handleGoogleLoginSuccess = () => {
			navigate("/");
		};

		window.addEventListener("googleLoginSuccess", handleGoogleLoginSuccess);

		return () => {
			window.removeEventListener(
				"googleLoginSuccess",
				handleGoogleLoginSuccess
			);
		};
	}, [navigate]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setIsLoading(true);
		try {
			const response = await axios.post<{
				access: string;
				refresh: string;
				full_name: string;
				user_type: UserType;
			}>("http://localhost:8000/auth/login/", {
				email: formData.email,
				password: formData.password,
			});
			const { access, refresh, full_name, user_type } = response.data;
			login(access, refresh, { full_name, user_type });
			navigate("/");
			toast.success(
				`Успешно сте најавени${user_type ? " како администратор" : ""}!`
			);
		} catch (err: unknown) {
			const axiosError = err as AxiosError<{
				[key: string]: string[] | string;
			}>;
			console.error("Error response data:", axiosError.response?.data);

			if (axiosError.response && axiosError.response.data) {
				const errorData = axiosError.response.data;
				const normalizedErrors: { [key: string]: string[] } = {};
				Object.entries(errorData).forEach(([field, message]) => {
					normalizedErrors[field] = Array.isArray(message)
						? message
						: [message];
				});
				setErrors(normalizedErrors);
			} else {
				setErrors({ detail: ["An unknown error occurred."] });
			}
		}
		setIsLoading(false);
	};
	return (
		<div className="flex flex-col items-center justify-center min-h-[83vh] py-4 px-4 bg-white">
			<form
				onSubmit={handleLogin}
				className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-sm"
			>
				<h2 className="text-xl font-semibold mb-3 sm:mb-4 text-center">
					Најава
				</h2>
				{errors.detail && (
					<div className="text-red-500 mb-2 sm:mb-3 text-sm">
						{errors.detail[0]}.
					</div>
				)}
				<input
					type="email"
					name="email"
					required
					value={formData.email}
					disabled={isLoading || googleLoginLoading}
					onChange={handleChange}
					placeholder="Email"
					className="w-full mb-2 sm:mb-3 p-2 border rounded"
				/>
				{errors.email && (
					<p className="text-red-500 text-sm mb-1 sm:mb-2">{errors.email[0]}</p>
				)}
				<PasswordInput
					name="password"
					value={formData.password}
					disabled={isLoading || googleLoginLoading}
					onChange={handleChange}
					placeholder="Лозинка"
					error={errors.password ? errors.password[0] : undefined}
				/>
				<p className="mb-3 sm:mb-4 text-sm text-center">
					Немаш профил?{" "}
					<Link to="/register" className="text-blue-500 hover:underline">
						Регистрирај се
					</Link>
				</p>
				<button
					type="submit"
					disabled={isLoading || googleLoginLoading}
					className={`w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 
						${isLoading || googleLoginLoading ? "opacity-70 cursor-not-allowed" : ""}`}
				>
					{isLoading ? "Се најавува..." : "Најави се"}
				</button>

				{useOAuth && (
					<>
						<div className="mt-3 sm:mt-4 text-center">
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-2 bg-white text-gray-500">или</span>
								</div>
							</div>
						</div>

						<button
							type="button"
							onClick={() => customGoogleLogin?.()}
							disabled={isLoading || googleLoginLoading}
							className={`w-full mt-3 sm:mt-4 bg-white border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50 flex items-center justify-center gap-2 ${
								googleLoginLoading || isLoading
									? "opacity-70 cursor-not-allowed"
									: ""
							}`}
						>
							<img src={googleLogo} alt="Google logo" className="w-5 h-5" />
							{googleLoginLoading ? "Се најавува..." : "Продолжи со Google"}
						</button>
					</>
				)}
			</form>
		</div>
	);
};

export default Login;
