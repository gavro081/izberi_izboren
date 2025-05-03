import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

interface Subject {
  id: number;
  name: string;
  study_track: string;
  year: number;
  professors: string[];
}

interface StudentFormProps {
  formData: any;
  subjects: Subject[];
  professors: string[];
}

const STUDY_TRACKS = ["SIIS", "SEIS", "PIT", "KI", "KN", "IMB"];
const STUDY_EFFORT = [1, 2, 3, 4, 5];
const YEARS = [1, 2, 3, 4];
const DOMAINS = ["Web Dev", "AI", "Data Science"];
const TECHNOLOGIES = ["React", "Django", "Flutter"];
const EVALUATIONS = ["Exams", "Projects", "Presentations"];

const StudentForm = ({ formData, subjects, professors }: StudentFormProps) => {
  const { token } = useAuth();

  const [index, setIndex] = useState(formData?.index || "");
  const [studyTrack, setStudyTrack] = useState(formData?.study_track || "");
  const [year, setYear] = useState(formData?.current_year || 1);
  const [passedSubjects, setPassedSubjects] = useState<number[]>(
    formData?.passed_subjects || []
  );
  const [studyEffort, setStudyEffort] = useState(formData?.study_effort || "");
  const [domains, setDomains] = useState<string[]>(
    formData?.preferred_domains || []
  );
  const [technologies, setTechnologies] = useState<string[]>(
    formData?.preferred_technologies || []
  );
  const [evaluation, setEvaluation] = useState(formData?.preferred_evaluation || "");
  const [favoriteProfs, setFavoriteProfs] = useState<string[]>(
    formData?.favorite_professors || []
  );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      index,
      study_track: studyTrack,
      current_year: year,
      passed_subjects: passedSubjects,
      study_effort: studyEffort,
      preferred_domains: domains,
      preferred_technologies: technologies,
      preferred_evaluation: evaluation,
      favorite_professors: favoriteProfs,
    };

    const method = formData ? "PUT" : "POST";
    const endpoint = "http://localhost:8000/auth/form/";

    const res = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) alert("Form submitted successfully!");
    else alert("Error submitting form.");
  };

  const filteredSubjects = subjects.filter(
    (subj) => subj.study_track === studyTrack && subj.year <= year
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Index"
        value={index}
        onChange={(e) => setIndex(e.target.value)}
        className="input"
      />

      <select
        value={studyTrack}
        onChange={(e) => setStudyTrack(e.target.value)}
        className="input"
      >
        <option value="">Choose Track</option>
        {STUDY_TRACKS.map((track) => (
          <option key={track} value={track}>
            {track}
          </option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className="input"
      >
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}. year
          </option>
        ))}
      </select>

      <div>
        <h3 className="font-semibold mb-1">Passed Subjects</h3>
        <div className="flex flex-wrap gap-2">
          {filteredSubjects.map((subject) => (
            <button
              type="button"
              key={subject.id}
              onClick={() =>
                toggleSelection(subject.id, setPassedSubjects, passedSubjects)
              }
              className={`px-2 py-1 border rounded ${
                passedSubjects.includes(subject.id) ? "bg-blue-200" : ""
              }`}
            >
              {subject.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-1">Preferred Domains</h3>
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

      <div>
        <h3 className="font-semibold mb-1">Preferred Technologies</h3>
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

      <div>
        <h3 className="font-semibold mb-1">Preferred Evaluation Method</h3>
        <select
          value={evaluation}
          onChange={(e) => setEvaluation(e.target.value)}
          className="input"
        >
          <option value="">Select Evaluation</option>
          {EVALUATIONS.map((ev) => (
            <option key={ev} value={ev}>
              {ev}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold mb-1">Favorite Professors</h3>
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

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </form>
  );
};

export default StudentForm;
