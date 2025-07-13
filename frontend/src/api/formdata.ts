import { toast } from "react-toastify";
import { StudentData } from "../components/types";
import axiosInstance from "./axiosInstance";

export const fetchFormData = async (
	token: string,
	setFormData: (data: StudentData | null) => void
) => {
	try {
		const response = await axiosInstance.get<StudentData>("/auth/form/", {
			headers: { Authorization: `Bearer ${token}` },
		});
		setFormData(response.data);
	} catch (error) {
		console.error("Could not fetch user form data", error);
		if ((error as any).response?.status !== 401) {
			toast.error("Настана грешка при барањето.");
		}
	}
};
