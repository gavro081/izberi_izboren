import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await axios.post<{
        access: string;
        refresh: string;
      }>("http://localhost:8000/auth/login/", {
        email: formData.email,
        password: formData.password,
      });
      const { access, refresh } = response.data;
      login(access, refresh);
      navigate("/");
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
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-lg shadow-md w-80"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>
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
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
