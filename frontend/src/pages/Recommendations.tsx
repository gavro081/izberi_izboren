import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Subject } from "../components/types";
import SubjectModal from "../components/SubjectCatalog/SubjectModal";
import { getSubjectPrerequisites } from "../components/SubjectCatalog/utils";
import useAxiosAuth from "../hooks/useAxiosAuth";

const Recommendations = () => {
  const axiosAuth = useAxiosAuth();
  const navigate = useNavigate();
  const [subjectData, setSubjectData] = useState<Subject[]>([]);
  const [recommendations, setRecommendations] = useState<Subject[]>([]);
  const [season_, setSeason] = useState<"winter" | "summer" | "all">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const mapToSeasonInt = (season: "winter" | "summer" | "all") => {
    if (season == "summer") return 0;
    if (season == "winter") return 1;
    return 2;
  };

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const season = mapToSeasonInt(season_);
      const response = await axiosAuth.get("/suggestion", {
        params: { season },
      });
      setRecommendations(response.data.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // need to fetch subject data so that we can compare the subject IDs (prerequisites store IDs, but we need names) in the modals for the recommendations
  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosAuth.get("/subjects");
      setSubjectData(response.data);
    };
    fetchData();
  }, [axiosAuth]);

  const subjectIdToNameMap = useMemo(() => {
    const map = new Map<number, string>();
    subjectData.forEach((subject) => {
      map.set(subject.id, subject.name);
    });
	return map;
  }, [subjectData]);

  const cycleSeason = () => {
    if (season_ === "all") setSeason("winter");
    else if (season_ === "winter") setSeason("summer");
    else setSeason("all");
  };

  const openSubjectView = (subject: Subject) => {
    navigate(`/subjects/${subject.id}`, {
      state: { from: "/recommendations" },
    });
  };

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const openSubjectDetails = (subject: Subject) => {
    setSelectedSubject(
      subjectData.find((item) => item.id == subject.id) ?? null
    );
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedSubject(null);
    setShowModal(false);
  };

  const getSeasonText = () => {
    switch (season_) {
      case "winter":
        return "Зимски";
      case "summer":
        return "Летен";
      case "all":
        return "Двата";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-1/3 bg-white shadow-lg p-8 flex flex-col justify-center items-center space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Препораки</h1>
          <p className="text-gray-600 text-lg">
            Откријте ги вашите идеални предмети!
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center hover:bg-blue-100 transition-colors duration-200">
          <p className="text-gray-700 mb-3">Избран семестар: </p>
          <p className="text-2xl font-semibold text-gray-800">
            {getSeasonText()}
          </p>
        </div>

        <button
          onClick={cycleSeason}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Промени семестар
        </button>

        <button
          onClick={fetchRecommendations}
          disabled={isLoading}
          className={`${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 hover:scale-105 shadow-md hover:shadow-lg"
          } text-white px-8 py-4 rounded-lg text-xl font-bold transition-all duration-200 flex items-center space-x-2`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Се вчитува...</span>
            </>
          ) : (
            <span>Вчитај препораки!</span>
          )}
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {recommendations.length > 0 ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Вашите препораки за {getSeasonText().toLowerCase()}{" "}
                {getSeasonText().toLowerCase() === "двата"
                  ? "семестри"
                  : "семестар"}
              </h2>
              <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[1100px]">
              {recommendations.map((subject, index) => (
                <div
                  key={subject.id}
                  className={`border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 relative ${
                    index % 2 === 0 ? "self-start" : "self-end"
                  }`}
                  style={{
                    height: "80%",
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.6s ease-out forwards",
                  }}
                >
                  <div className="p-4 min-h-full flex flex-col gap-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {subject.name}
                        </h3>
                        <p className="text-gray-600">{subject.code}</p>
                      </div>
                    </div>

                    {subject.subject_info?.tags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {subject.subject_info.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-green-100 border-green-300 text-green-800 text-xs px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between mt-auto gap-3">
                      <button
                        onClick={() => openSubjectDetails(subject)}
                        className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <img
                          src="src/assets/eye.svg"
                          className="w-4 h-4 mr-1"
                        />
                        Краток преглед
                      </button>
                      <button
                        onClick={() => openSubjectView(subject)}
                        className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-900 text-white text-sm font-medium rounded-md transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        Отвори предмет
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-gray-400 mb-6">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              Започнете со пребарување!
            </h3>
            <p className="text-gray-500 text-lg max-w-md">
              Изберете ја саканата сезона и кликнете на "Вчитај препораки" за да
              ги откриете вашите идеални предмети!
            </p>
          </div>
        )}
      </div>
      {showModal && selectedSubject && (
        <SubjectModal
          selectedSubject={selectedSubject}
          closeModal={closeModal}
          subjectPrerequisites={getSubjectPrerequisites(
            selectedSubject,
            subjectIdToNameMap
          )}
        />
      )}
    </div>
  );
};

export default Recommendations;
