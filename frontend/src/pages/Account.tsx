import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import StudentForm from "../components/StudentForm";
import { Subject } from "../components/types";
import { StudentData } from "../components/types";

const Account = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState<StudentData | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const resForm = await fetch("http://localhost:8000/auth/form/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formJson = await resForm.json();
      if (resForm.ok) {
        setFormData(formJson);
      }
      console.log(formJson);
      const resSubjects = await fetch("http://localhost:8000/subjects");
      if (resSubjects.ok) {
        const subJson: Subject[] = await resSubjects.json();
        console.log(subJson);
        setSubjects(subJson || []);
        const allProfessors: string[] = subJson
          .flatMap((subject: Subject) => subject.subject_info.professors)
          .filter((p): p is string => typeof p === "string");

        const uniqueProfessors = Array.from(new Set(allProfessors));
        const filteredProfessors = uniqueProfessors.filter((prof) => prof.trim().toLowerCase() !== 'сите професори');
        setProfessors(filteredProfessors);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Account info</h1>
      <StudentForm
        formData={formData}
        subjects={subjects}
        professors={professors}
      />
    </div>
  );
};

export default Account;
