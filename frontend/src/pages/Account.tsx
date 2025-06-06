import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentForm from "../components/StudentForm/StudentForm";
import { StudentData } from "../components/types";
import useAxiosAuth from "../hooks/useAxiosAuth";

const Account = () => {
    const axiosAuth = useAxiosAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<StudentData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // This function will run once when the component mounts
        const fetchData = async () => {
            try {
                // Simply ask for the data.
                // If the token is expired/missing, the interceptor will
                // automatically refresh it and retry this request.
                // This 'await' will just pause until the whole process is complete.
                const resForm = await axiosAuth.get("/auth/form/");
                setFormData(resForm.data);
            } catch (error) {
                // This catch block will only be triggered if the token refresh
                // fails and the interceptor gives up. In that case, we should
                // probably navigate the user away.
                console.error("Could not fetch form data after retries.", error);
                //navigate("/login");
            } finally {
                // This will run whether the request succeeded or failed.
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