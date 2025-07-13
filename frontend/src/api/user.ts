import { Dispatch, SetStateAction } from "react";
import { User } from "../components/types";
import axiosInstance from "./axiosInstance";

export const fetchUser = async (
	token: string,
	setUser: Dispatch<SetStateAction<User | null>>
) => {
	try {
		const response = await axiosInstance.get<User>("/auth/user/", {
			headers: { Authorization: `Bearer ${token}` },
		});
		setUser(response.data);
	} catch (error) {
		console.error("Could not fetch user data on load", error);
	}
};
