import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import StudentForm from "../components/StudentForm";
import { Subject } from "../components/types";
import { StudentData } from "../components/types";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const Account = () => {
  const navigate = useNavigate();
  const { accessToken, refreshAccessToken } = useAuth();
  const [tokenChecked, setTokenChecked] = useState(false);
  const [formData, setFormData] = useState<StudentData | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<string[]>([]);

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
  }, [refreshAccessToken]);

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) {
        return;
      }
      console.log(accessToken);
      try {
        const resForm = await axiosInstance.get("/auth/form/");
        setFormData(resForm.data);
        const resSubjects = await fetch("http://localhost:8000/subjects");
        if (resSubjects.ok) {
          const subJson: Subject[] = await resSubjects.json();
          setSubjects(subJson || []);
          const allProfessors: string[] = subJson
            .flatMap((subject: Subject) => subject.subject_info.professors)
            .filter((p): p is string => typeof p === "string");

          const uniqueProfessors = Array.from(new Set(allProfessors));
          const filteredProfessors = uniqueProfessors.filter(
            (prof) => prof.trim().toLowerCase() !== "сите професори"
          );
          setProfessors(filteredProfessors);
        }
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
      <StudentForm
        formData={formData}
        subjects={subjects}
        professors={professors}
      />
    </div>
  );
};

export default Account;
