import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PasswordInput from "../components/PasswordInput";
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
	const { login } = useAuth();
	const [isLogging, setIsLogging] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setIsLogging(true);
		try {
			const response = await axios.post<{
				access: string;
				refresh: string;
				full_name: string;
				user_type: string;
			}>("http://localhost:8000/auth/login/", {
				email: formData.email,
				password: formData.password,
			});
			const { access, refresh, full_name, user_type } = response.data;
			login(access, refresh, { full_name, user_type });
			navigate("/");
			toast.success("Успешно сте најавени!");
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
		setIsLogging(false);
	};
	return (
		<div className="flex flex-col items-center justify-center h-[83vh] bg-white">
			<form
				onSubmit={handleLogin}
				className="bg-white p-6 rounded-lg shadow-md w-80"
			>
				<h2 className="text-xl font-semibold mb-4 text-center">Најава</h2>
				{errors.detail && (
					<div className="text-red-500 mb-3 text-sm">{errors.detail[0]}.</div>
				)}
				<input
					type="email"
					name="email"
					required
					value={formData.email}
					onChange={handleChange}
					placeholder="Email"
					className="w-full mb-3 p-2 border rounded"
				/>
				{errors.email && (
					<p className="text-red-500 text-sm mb-2">{errors.email[0]}</p>
				)}
				<PasswordInput
					name="password"
					value={formData.password}
					onChange={handleChange}
					placeholder="Лозинка"
					error={errors.password ? errors.password[0] : undefined}
				/>
				<p className="mb-4 text-sm text-center">
					Немаш профил?{" "}
					<Link to="/register" className="text-blue-500 hover:underline">
						Регистрирај се
					</Link>
				</p>
				<button
					type="submit"
					className={`w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 
						${isLogging ? "opacity-70 cursor-not-allowed" : ""}`}
				>
					{isLogging ? "Се најавува..." : "Најави се"}
				</button>
			</form>
		</div>
	);
};

export default Login;
