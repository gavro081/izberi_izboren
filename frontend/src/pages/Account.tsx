import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import StudentForm from "../components/StudentForm";

interface Subject {
  id: number;
  name: string;
  study_track: string;
  year: number;
  subject_info: {
    professors: string[];
  }
}

const Account = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState<any>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const resForm = await fetch("http://localhost:8000/auth/form", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formJson = await resForm.json();
      if (resForm.ok) {
        setFormData(formJson);
      }

      const resSubjects = await fetch("http://localhost:8000/subjects");
      const subJson = await resSubjects.json();
      if (resSubjects.ok) {
        setSubjects(subJson || []);
        console.log(subJson)
        const allProfessors = subJson.subject_info.professors
          .flatMap((subject: Subject) => subject.subject_info.professors);
        console.log(allProfessors)
        const uniqueProfessors = Array.from(new Set(allProfessors));
        console.log(uniqueProfessors)
        setProfessors(uniqueProfessors);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Account info</h1>
      <StudentForm formData={formData} subjects={subjects} professors={professors} />
    </div>
  );
};

export default Account;
