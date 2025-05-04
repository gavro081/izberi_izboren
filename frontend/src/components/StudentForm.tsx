import { useState } from "react";
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
  const { token } = useAuth();
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
    formData?.preferred_evaluation || ""
  );
  const [favoriteProfs, setFavoriteProfs] = useState<string[]>(
    formData?.favorite_professors || []
  );

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!index.trim()) {
      errors.index = "Индексот e задолжителен.";
    } else if (!/^\d{6}$/.test(index)) {
      // Validate if index is exactly 6 digits
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

    const method = formData?.current_year ? "PUT" : "POST";
    const endpoint = "http://localhost:8000/auth/form/";

    const res = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) alert("Form submitted successfully!");
    else alert("Error submitting form.");
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Индекс"
          value={index}
          onChange={(e) => setIndex(e.target.value)}
          className="input"
        />
        {validationErrors.index && (
          <span className="text-red-600 text-sm">{validationErrors.index}</span>
        )}
      </div>
      <div>
        <select
          value={studyTrack}
          onChange={(e) => setStudyTrack(e.target.value as Programs | "")}
          className="input"
        >
          <option value="">Смер</option>
          {STUDY_TRACKS.map((track) => (
            <option key={track} value={track}>
              {track}
            </option>
          ))}
        </select>
        {validationErrors.studyTrack && (
          <span className="text-red-600 text-sm">
            {validationErrors.studyTrack}
          </span>
        )}
      </div>
      <div>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="input"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}. година
            </option>
          ))}
        </select>
        {validationErrors.year && (
          <span className="text-red-600 text-sm">{validationErrors.year}</span>
        )}
      </div>
      <div>
        <h3 className="font-semibold mb-1">Положени задолжителни предмети</h3>
        <div className="flex flex-wrap gap-2">
          {filteredMandatorySubjects.map((subject) => {
            const isSelected = passedSubjects.some((s) => s.id === subject.id);
            return (
              <button
                type="button"
                key={subject.id}
                onClick={() => toggleSubject(subject)}
                className={`flex items-center gap-6 px-3 py-2 border rounded-md transition-all duration-200 ease-in-out 
                  ${
                    isSelected
                      ? "bg-green-500 text-white border-green-600 shadow-md transform "
                      : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                  }`}
                // for accessibility
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <span className="flex items-center justify-center text-white">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </span>
                )}
                {subject.name}
              </button>
            );
          })}
        </div>
      </div>
      {validationErrors.passedSubjects && (
        <span className="text-red-600 text-sm">
          {validationErrors.passedSubjects}
        </span>
      )}
      <div>
        <h3 className="font-semibold mb-1">Положени изборни предмети</h3>
        <div className="flex flex-wrap gap-2">
          {filteredElectiveSubjects.map((subject) => {
            const isSelected = passedSubjects.some((s) => s.id === subject.id);
            return (
              <button
                type="button"
                key={subject.id}
                onClick={() => toggleSubject(subject)}
                className={`flex items-center gap-6 px-3 py-2 border rounded-md transition-all duration-200 ease-in-out 
                  ${
                    isSelected
                      ? "bg-green-500 text-white border-green-600 shadow-md transform "
                      : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                  }`}
                // for accessibility
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <span className="flex items-center justify-center text-white">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </span>
                )}
                {subject.name}
              </button>
            );
          })}
        </div>
      </div>
      {validationErrors.passedSubjects && (
        <span className="text-red-600 text-sm">
          {validationErrors.passedSubjects}
        </span>
      )}
      <div>
        <h3 className="font-semibold mb-1">Вложен труд</h3>
        <select
          value={studyEffort}
          onChange={(e) => setStudyEffort(e.target.value)}
          className="input"
        >
          <option value="">Одбери колку труд вложуваш при учење</option>
          {STUDY_EFFORT.map((effort) => (
            <option key={effort} value={effort}>
              {effort}
            </option>
          ))}
        </select>
      </div>
      {validationErrors.studyEffort && (
        <span className="text-red-600 text-sm">
          {validationErrors.studyEffort}
        </span>
      )}
      <div>
        <h3 className="font-semibold mb-1">Полиња на интерес</h3>
        <div className="flex gap-2 flex-wrap">
          {DOMAINS.map((d) => (
            <button
              type="button"
              key={d}
              onClick={() => toggleSelection(d, setDomains, domains)}
              className={`px-2 py-1 border rounded ${
                domains.includes(d) ? "bg-green-200" : ""
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      {validationErrors.domains && (
        <span className="text-red-600 text-sm">{validationErrors.domains}</span>
      )}
      <div>
        <h3 className="font-semibold mb-1">Преферирани технологии</h3>
        <div className="flex gap-2 flex-wrap">
          {TECHNOLOGIES.map((tech) => (
            <button
              type="button"
              key={tech}
              onClick={() =>
                toggleSelection(tech, setTechnologies, technologies)
              }
              className={`px-2 py-1 border rounded ${
                technologies.includes(tech) ? "bg-yellow-200" : ""
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>
      {validationErrors.technologies && (
        <span className="text-red-600 text-sm">
          {validationErrors.technologies}
        </span>
      )}
      <div>
        <h3 className="font-semibold mb-1">Преферирани начин на оценување</h3>
        <select
          value={evaluation}
          onChange={(e) => setEvaluation(e.target.value)}
          className="input"
        >
          <option value="">Како сакаш да те оценат</option>
          {EVALUATIONS.map((ev) => (
            <option key={ev} value={ev}>
              {ev}
            </option>
          ))}
        </select>
      </div>
      {validationErrors.evaluation && (
        <span className="text-red-600 text-sm">
          {validationErrors.evaluation}
        </span>
      )}
      <div>
        <h3 className="font-semibold mb-1">Омилени професори</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {professors.map((prof) => (
            <button
              key={prof}
              type="button"
              onClick={() =>
                toggleSelection(prof, setFavoriteProfs, favoriteProfs)
              }
              className={`px-2 py-1 border rounded ${
                favoriteProfs.includes(prof) ? "bg-pink-200" : ""
              }`}
            >
              {prof}
            </button>
          ))}
        </div>
      </div>
      {validationErrors.favoriteProfessors && (
        <span className="text-red-600 text-sm">
          {validationErrors.favoriteProfessors}
        </span>
      )}
      <div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
