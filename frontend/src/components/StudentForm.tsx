import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { StudentData } from "./types";
import { Subject } from "./types";
import { Programs } from "./types";

interface StudentFormProps {
  formData: StudentData | null;
  subjects: Subject[];
  professors: string[];
}

const STUDY_TRACKS = ["SIIS23", "IE23", "PIT23", "KI23", "KN23", "IMB23"];
const STUDY_EFFORT = [1, 2, 3, 4, 5];
const YEARS = [1, 2, 3, 4];
const DOMAINS = ["Web Dev", "AI", "Data Science", "Немам"];
const TECHNOLOGIES = ["React", "Django", "Flutter", "Немам"];
const EVALUATIONS = ["Испити", "Проекти", "Семинарски", "Немам"];

const StudentForm = ({ formData, subjects, professors }: StudentFormProps) => {
  const { accessToken } = useAuth();
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [index, setIndex] = useState(formData?.index || "");
  const [studyTrack, setStudyTrack] = useState<Programs | "">(
    (formData?.study_track as Programs) || ""
  );
  const [year, setYear] = useState(formData?.current_year || 1);
  const [passedSubjects, setPassedSubjects] = useState<Subject[]>(
    formData?.passed_subjects || []
  );
  const [studyEffort, setStudyEffort] = useState(formData?.study_effort || "");
  const [domains, setDomains] = useState<string[]>(
    formData?.preferred_domains || []
  );
  const [technologies, setTechnologies] = useState<string[]>(
    formData?.preferred_technologies || []
  );
  const [evaluation, setEvaluation] = useState(
    formData?.preferred_evaluation?.[0] || ""
  );
  const [favoriteProfs, setFavoriteProfs] = useState<string[]>(
    formData?.favorite_professors || []
  );
  const [formStatus, setFormStatus] = useState<{
    isSubmitting: boolean;
    message: string;
    isError: boolean;
  }>({
    isSubmitting: false,
    message: "",
    isError: false,
  });

  // Update form when formData changes (e.g., after fetching user data)
  useEffect(() => {
    if (formData) {
      setIndex(formData.index || "");
      setStudyTrack((formData.study_track as Programs) || "");
      setYear(formData.current_year || 1);
      setPassedSubjects(formData.passed_subjects || []);
      setStudyEffort(formData.study_effort || "");
      setDomains(formData.preferred_domains || []);
      setTechnologies(formData.preferred_technologies || []);
      setEvaluation(formData.preferred_evaluation?.[0] || "");
      setFavoriteProfs(formData.favorite_professors || []);
    }
  }, [formData]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!index.trim()) {
      errors.index = "Индексот e задолжителен.";
    } else if (!/^\d{6}$/.test(index)) {
      errors.index = "Индексот треба да има точно 6 цифри.";
    }
    if (!studyTrack) errors.studyTrack = "Избери насока.";
    if (!year) errors.year = "Избери година.";
    if (!studyEffort) errors.studyEffort = "Избери пожелен вложен труд.";
    if (passedSubjects.length === 0)
      errors.passedSubjects = "Избери барем еден предмет.";
    if (domains.length === 0) errors.domains = "Избери барем едно поле.";
    if (technologies.length === 0)
      errors.technologies = "Избери барем една технологија.";
    if (!evaluation) errors.evaluation = "Избери тип на оценување.";
    return errors;
  };

  const toggleSelection = (
    value: string | number,
    setter: React.Dispatch<React.SetStateAction<any[]>>,
    current: any[]
  ) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  const toggleSubject = (subject: Subject) => {
    const exists = passedSubjects.some((s) => s.id === subject.id);
    if (exists) {
      setPassedSubjects(passedSubjects.filter((s) => s.id !== subject.id));
    } else {
      setPassedSubjects([...passedSubjects, subject]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    setFormStatus({
      isSubmitting: true,
      message: "",
      isError: false,
    });

    const payload = {
      index,
      study_track: studyTrack,
      current_year: year,
      passed_subjects: passedSubjects.map((subject) => subject.id),
      study_effort: studyEffort,
      preferred_domains: domains,
      preferred_technologies: technologies,
      preferred_evaluation: [evaluation],
      favorite_professors: favoriteProfs,
    };

    try {
      // For updating existing form data use PATCH instead of PUT for partial updates
      const method = formData?.current_year ? "PATCH" : "POST";
      const endpoint = "http://localhost:8000/auth/form/";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFormStatus({
          isSubmitting: false,
          message: "Формата е успешно зачувана!",
          isError: false,
        });

        setTimeout(() => {
          setFormStatus((prev) => ({ ...prev, message: "" }));
        }, 5000);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error submitting form");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setFormStatus({
        isSubmitting: false,
        message: `Грешка при зачувување: ${(error as Error).message}`,
        isError: true,
      });
    }
  };

  const filteredMandatorySubjects = studyTrack
    ? subjects.filter(
        (subj) =>
          subj.subject_info.mandatory_for.includes(studyTrack) &&
          subj.subject_info.semester <= year * 2
      )
    : [];
  const filteredElectiveSubjects = studyTrack
    ? subjects.filter(
        (subj) =>
          subj.subject_info.elective_for.includes(studyTrack) &&
          subj.subject_info.semester <= year * 2
      )
    : [];
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        {formData?.current_year ? "Ажурирај ги податоците" : "Внеси податоци"}
      </h2>

      {formStatus.message && (
        <div
          className={`px-4 py-3 rounded mb-4 ${
            formStatus.isError
              ? "bg-red-100 border border-red-400 text-red-700"
              : "bg-green-100 border border-green-400 text-green-700"
          }`}
        >
          {formStatus.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Индекс
          </label>
          <input
            type="text"
            placeholder="Внеси индекс"
            value={index}
            onChange={(e) => setIndex(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {validationErrors.index && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.index}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Смер
          </label>
          <select
            value={studyTrack}
            onChange={(e) => setStudyTrack(e.target.value as Programs | "")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Избери смер</option>
            {STUDY_TRACKS.map((track) => (
              <option key={track} value={track}>
                {track}
              </option>
            ))}
          </select>
          {validationErrors.studyTrack && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.studyTrack}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Година на студии
        </label>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}. година
            </option>
          ))}
        </select>
        {validationErrors.year && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.year}</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Положени задолжителни предмети
        </h3>
        {filteredMandatorySubjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {filteredMandatorySubjects.map((subject) => {
              const isSelected = passedSubjects.some(
                (s) => s.id === subject.id
              );
              return (
                <button
                  type="button"
                  key={subject.id}
                  onClick={() => toggleSubject(subject)}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-md transition-all duration-200 
                    ${
                      isSelected
                        ? "bg-green-500 text-white border-green-600 shadow-md"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                    }`}
                  aria-pressed={isSelected}
                >
                  {isSelected && (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  )}
                  <span>{subject.name}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 italic">
            {!studyTrack
              ? "Избери смер и година за да се прикажат предметите"
              : "Нема задолжителни предмети за избраниот смер и година"}
          </p>
        )}
        {validationErrors.passedSubjects && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.passedSubjects}
          </p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Положени изборни предмети
        </h3>
        {filteredElectiveSubjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {filteredElectiveSubjects.map((subject) => {
              const isSelected = passedSubjects.some(
                (s) => s.id === subject.id
              );
              return (
                <button
                  type="button"
                  key={subject.id}
                  onClick={() => toggleSubject(subject)}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-md transition-all duration-200 
                    ${
                      isSelected
                        ? "bg-green-500 text-white border-green-600 shadow-md"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                    }`}
                  aria-pressed={isSelected}
                >
                  {isSelected && (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  )}
                  <span>{subject.name}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 italic">
            {!studyTrack
              ? "Избери смер и година за да се прикажат предметите"
              : "Нема изборни предмети за избраниот смер и година"}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Вложен труд при учење
        </label>
        <select
          value={studyEffort}
          onChange={(e) => setStudyEffort(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Одбери колку труд вложуваш при учење</option>
          {STUDY_EFFORT.map((effort) => (
            <option key={effort} value={effort}>
              {effort}
            </option>
          ))}
        </select>
        {validationErrors.studyEffort && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.studyEffort}
          </p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Полиња на интерес
        </h3>
        <div className="flex flex-wrap gap-2">
          {DOMAINS.map((d) => (
            <button
              type="button"
              key={d}
              onClick={() => toggleSelection(d, setDomains, domains)}
              className={`px-3 py-2 border rounded-md transition-colors ${
                domains.includes(d)
                  ? "bg-blue-100 border-blue-300 text-blue-800"
                  : "bg-white hover:bg-gray-50 border-gray-300"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        {validationErrors.domains && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.domains}
          </p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Преферирани технологии
        </h3>
        <div className="flex flex-wrap gap-2">
          {TECHNOLOGIES.map((tech) => (
            <button
              type="button"
              key={tech}
              onClick={() =>
                toggleSelection(tech, setTechnologies, technologies)
              }
              className={`px-3 py-2 border rounded-md transition-colors ${
                technologies.includes(tech)
                  ? "bg-yellow-100 border-yellow-300 text-yellow-800"
                  : "bg-white hover:bg-gray-50 border-gray-300"
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
        {validationErrors.technologies && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.technologies}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Преферирани начин на оценување
        </label>
        <select
          value={evaluation}
          onChange={(e) => setEvaluation(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Како сакаш да те оценат</option>
          {EVALUATIONS.map((ev) => (
            <option key={ev} value={ev}>
              {ev}
            </option>
          ))}
        </select>
        {validationErrors.evaluation && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.evaluation}
          </p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Омилени професори
        </h3>
        <div className="flex flex-wrap gap-2">
          {professors.map((prof) => (
            <button
              key={prof}
              type="button"
              onClick={() =>
                toggleSelection(prof, setFavoriteProfs, favoriteProfs)
              }
              className={`px-3 py-2 border rounded-md transition-colors ${
                favoriteProfs.includes(prof)
                  ? "bg-pink-100 border-pink-300 text-pink-800"
                  : "bg-white hover:bg-gray-50 border-gray-300"
              }`}
            >
              {prof}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={formStatus.isSubmitting}
          className={`w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
            formStatus.isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {formStatus.isSubmitting
            ? "Се зачувува..."
            : formData
            ? "Ажурирај"
            : "Зачувај"}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
