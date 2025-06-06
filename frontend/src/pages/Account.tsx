import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentForm from "../components/StudentForm/StudentForm";
import { StudentData } from "../components/types";
import useAxiosAuth from "../hooks/useAxiosAuth";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";

const Account = () => {
    const axiosAuth = useAxiosAuth();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [formData, setFormData] = useState<StudentData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resForm = await axiosAuth.get("/auth/form/");
                setFormData(resForm.data);
            } catch (error) {
                console.error("Error fetching form data:", error);
                toast.error("Could not fetch form data after retries.");
                logout()
                navigate("/login");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [axiosAuth, navigate]); 

    return (
        <div className="p-4">
            <StudentForm
                formData={formData}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
            />
        </div>
    );
};

export default Account;