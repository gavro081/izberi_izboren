import StudentForm from "../components/StudentForm/StudentForm";
import { useAuth } from "../hooks/useAuth";

const Account = () => {
	const { formData } = useAuth();
	const isLoading = formData === null;
	return (
		<div className="p-4 bg-white">
			<StudentForm
				formData={formData}
				isLoading={isLoading}
			/>
		</div>
	);
};

export default Account;
