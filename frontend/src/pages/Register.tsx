import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../components/PasswordInput";
import { useAuth } from "../hooks/useAuth";

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
    Partial<RegisterForm> & { non_field_errors?: string[] }
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
    setLoading(true);

    try {
      console.log(formData);
      const response = await axios.post(
        "http://localhost:8000/auth/register/",
        {
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          full_name: formData.fullName,
        }
      );

      const { token } = response.data;
      login(token);
      navigate("/");
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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded-lg shadow-md w-80"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Register</h2>
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
          <p className="text-red-500 text-sm mb-2">{errors.email[0]}</p>
        )}
        <PasswordInput
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password ? errors.password[0] : undefined}
        />
        <PasswordInput
          name="confirmPassword"
          value={formData.password}
          onChange={handleChange}
        />
        <input
          type="text"
          name="fullName"
          required
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full mb-3 p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};
export default Register;
