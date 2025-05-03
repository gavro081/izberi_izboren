import { useEffect, useState } from "react";
import FilterSidebar from "./FilterSidebar";
import SkeletonCard from "./SkeletonCard";
import StaffSearch from "./StaffSearch";
import SubjectList from "./SubjectList";
import SubjectModal from "./SubjectModal";
import { Filters, Subject } from "../types";
import { filterSubjects, getRandomStaff, resetFilters } from "./utils";
const SubjectCatalog = () => {
  const [visibleCourses, setVisibleCourses] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [professorSearchTerm, setProfessorSearchTerm] = useState<string>("");
  const [assistantSearchTerm, setAssistantSearchTerm] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectData, setSubjectData] = useState<Subject[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [randomStaff, setRandomStaff] = useState(["", ""]);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    season: "",
    semester: [],
    level: [],
    activated: "",
    mandatoryFor: [],
    electiveFor: [],
    professors: [],
    assistants: [],
    hasPrerequisites: false,
  });

  const filteredSubjects: Subject[] = filterSubjects({
    subjectData,
    searchTerm,
    professorSearchTerm,
    assistantSearchTerm,
    filters,
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("http://localhost:8000/subjects");
      const data = await response.json();
	  // ova se eba poso veke data ne e data.subjects tuku e samo data (ne znam sto da se napravi)
      setSubjectData(data);
      setIsLoaded(true);
    };
    fetchData();
  }, []);

  useEffect(() => {
    getRandomStaff(subjectData, setRandomStaff);
  }, [subjectData]);

  const loadMore = () => {
    setVisibleCourses((prev) => prev + 10);
  };

  const openSubjectDetails = (subject: Subject) => {
    setSelectedSubject(
      subjectData.find((item) => item.id == subject.id) ?? null
    );
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const getSubjectPrerequisites = () => {
    if (!selectedSubject) return "Нема предуслов";
    return "subjects" in selectedSubject?.info.prerequisite
      ? selectedSubject.info.prerequisite.subjects.map(
          (item) =>
            subjectData.find((subject) => subject.id === item)?.name || "/"
        )
      : "credits" in selectedSubject.info.prerequisite
      ? selectedSubject.info.prerequisite.credits
      : "Нема предуслов";
  };

  return (
    <div className="mx-auto p-4 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Преглед на сите предмети</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 bg-gray-50 p-4 rounded-lg">
          <FilterSidebar
            setSearchTerm={setSearchTerm}
            setProfessorSearchTerm={setProfessorSearchTerm}
            setAssistantSearchTerm={setAssistantSearchTerm}
            setFilters={setFilters}
            filters={filters}
          />
          <StaffSearch
            randomStaff={randomStaff}
            professorSearchTerm={professorSearchTerm}
            assistantSearchTerm={assistantSearchTerm}
            setProfessorSearchTerm={setProfessorSearchTerm}
            setAssistantSearchTerm={setAssistantSearchTerm}
          />
        </div>
        {/* Main content */}
        <div className="flex-1">
          {/* Search bar */}
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Пребарувај предмети по име, код, опис"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-4 pr-12 border border-gray-300 rounded-lg 
							focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {/* <button
							className="absolute right-2 top-1/2 transform -translate-y-1/2
						 bg-gray-800 text-white px-4 py-1 rounded-lg"
						>
							Избриши
						</button> */}
          </div>

          {/* Course grid */}

          {!isLoaded ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(9)].map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : (
            <SubjectList
              filteredSubjects={filteredSubjects}
              visibleCourses={visibleCourses}
              openSubjectDetails={openSubjectDetails}
            />
          )}

          {/* Load more button */}
          {isLoaded && filteredSubjects.length > visibleCourses && (
            <div className="mt-5 text-center">
              <button
                onClick={loadMore}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Погледни повеќе
              </button>
            </div>
          )}

          {/* No results message */}
          {isLoaded && filteredSubjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Не постојат такви предмети
              </p>
              <button
                onClick={() =>
                  resetFilters(
                    setSearchTerm,
                    setProfessorSearchTerm,
                    setAssistantSearchTerm,
                    setFilters
                  )
                }
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Ресетирај филтри
              </button>
            </div>
          )}
        </div>
      </div>
      {showModal && selectedSubject && (
        <SubjectModal
          selectedSubject={selectedSubject}
          closeModal={closeModal}
          subjectPrerequisites={getSubjectPrerequisites()}
        />
      )}
    </div>
  );
};

export default SubjectCatalog;
