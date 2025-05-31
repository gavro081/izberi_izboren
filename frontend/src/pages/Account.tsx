import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import StudentForm from "../components/StudentForm/StudentForm";
import { StudentData } from "../components/types";
import { useAuth } from "../hooks/useAuth";

const Account = () => {
	const navigate = useNavigate();
	const { accessToken, refreshAccessToken } = useAuth();
	const [tokenChecked, setTokenChecked] = useState(false);
	const [formData, setFormData] = useState<StudentData | null>(null);

	useEffect(() => {
		const checkToken = async () => {
			let accessToken = localStorage.getItem("access_token");

			if (!accessToken) {
				accessToken = await refreshAccessToken();
				if (accessToken) {
					localStorage.setItem("access_token", accessToken);
				} else {
					navigate("/login");
					return;
				}
			}
			setTokenChecked(true);
		};
		checkToken();
	}, [refreshAccessToken, navigate]);

	useEffect(() => {
		const fetchData = async () => {
			if (!accessToken) {
				return;
			}
			try {
				const resForm = await axiosInstance.get("/auth/form/");
				setFormData(resForm.data);
			} catch (error) {
				console.error("Error fetching data.", error);
			}
		};
		if (tokenChecked) {
			fetchData();
		}
	}, [tokenChecked, accessToken]);

	return (
		<div className="p-4">
			<StudentForm formData={formData} />
		</div>
	);
};

export default Account;
