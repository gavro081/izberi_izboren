import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginForm {
	email: string;
	password: string;
}

const Login: React.FC = () => {
	const [formData, setFormData] = useState<LoginForm>({
		email: "",
		password: "",
	});
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		try {
			console.log(formData);
			const response = await axios
				.post("http://localhost:8000/auth/login/", {
					email: formData.email,
					password: formData.password,
				})
				.catch((error: AxiosError) => {
					console.error(
						"Registration failed:",
						error.response?.data || error.message
					);
					setError(
						error.response?.data?.error ||
							"Registration failed. Please try again."
					);
				});
			// property data does not exist on type 'void'?
			const token = response.data.token;
			localStorage.setItem("token", token);

			navigate("/");
			// ovde ne znam sto so err i any da pravam :()
		} catch (err: AxiosError) {
			setError("Login failed. Please try again.");
		}
	};
	return (
		<div className="flex flex-col items-center justify-center h-screen bg-gray-50">
			<form
				onSubmit={handleLogin}
				className="bg-white p-6 rounded-lg shadow-md w-80"
			>
				<h2 className="text-xl font-semibold mb-4 text-center">Login</h2>
				{error && <div className="text-red-500 mb-3 text-sm">{error}</div>}
				<input
					type="email"
					name="email"
					required
					value={formData.email}
					onChange={handleChange}
					placeholder="Email"
					className="w-full mb-3 p-2 border rounded"
				/>
				<input
					type="password"
					name="password"
					required
					value={formData.password}
					onChange={handleChange}
					placeholder="Password"
					className="w-full mb-3 p-2 border rounded"
				/>
				<button
					type="submit"
					className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
				>
					Login
				</button>
			</form>
		</div>
	);
};

export default Login;
