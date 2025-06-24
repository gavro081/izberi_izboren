import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PasswordInput from "../components/PasswordInput";
import { useAuth } from "../hooks/useAuth";
import { User } from "../context/AuthContext";

interface RegisterForm {
	email: string;
	password: string;
	confirmPassword: string;
	fullName: string;
}

const Register: React.FC = () => {
	const [formData, setFormData] = useState<RegisterForm>({
		email: "",
		password: "",
		confirmPassword: "",
		fullName: "",
	});
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<
		Partial<Record<keyof RegisterForm, string[]>> & {
			non_field_errors?: string[];
		}
	>({});
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		if (formData.password !== formData.confirmPassword) {
			setErrors({ confirmPassword: ["Password do not match. "] });
			return;
		}
		setLoading(true);

		try {
			const response = await axios.post<{
				access: string;
				refresh: string;
				user: User;
			}>("http://localhost:8000/auth/register/", {
				email: formData.email,
				password: formData.password,
				confirm_password: formData.confirmPassword,
				full_name: formData.fullName,
			});
			console.log(response.data);
			const { access, refresh, user } = response.data;
			login(access, refresh, user);
			toast.success("Успешна регистрација!");
			navigate("/account");
		} catch (err: unknown) {
			const axiosError = err as AxiosError<{
				[key: string]: string[] | string;
			}>;
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
				setErrors({ non_field_errors: ["An unexpected error occurred."] });
			}
		} finally {
			setLoading(false);
		}
	};
	return (
		<div className="flex flex-col items-center justify-center h-[83vh] bg-white">
			<form
				onSubmit={handleRegister}
				className="bg-white p-6 rounded-lg h-auto shadow-md w-80"
			>
				<h2 className="text-xl font-semibold mb-4 text-center">Регистрација</h2>
				{errors.non_field_errors && (
					<div className="text-red-500 mb-3 text-sm">
						{errors.non_field_errors[0]}
					</div>
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
					<p className="text-red-500 text-sm mb-2">
						Постои корисник со оваа адреса.
					</p>
				)}
				<PasswordInput
					name="password"
					value={formData.password}
					onChange={handleChange}
					placeholder="Лозинка"
					error={
						errors.password
							? "Лозинката е едноставна. Треба да содржи барем 8 карактери и еден специјален знак."
							: undefined
					}
				/>
				<PasswordInput
					name="confirmPassword"
					value={formData.confirmPassword}
					placeholder="Потврди ја лозинката"
					onChange={handleChange}
				/>
				{errors.confirmPassword && (
					<p className="text-red-500 text-sm mb-2">Лозинките не се совпаѓаат</p>
				)}
				<input
					type="text"
					name="fullName"
					required
					value={formData.fullName}
					onChange={handleChange}
					placeholder="Име презиме"
					className="w-full mb-3 p-2 border rounded"
				/>
				<p className="text-sm text-center mb-4">
					Имаш профил?{" "}
					<Link to="/login" className="text-blue-600 hover:underline">
						Најави се
					</Link>
				</p>
				<button
					type="submit"
					disabled={loading}
					className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${
						loading ? "opacity-50 cursor-not-allowed" : ""
					}`}
				>
					{loading ? "Се регистрира..." : "Регистрирај се"}
				</button>
			</form>
		</div>
	);
};
export default Register;
