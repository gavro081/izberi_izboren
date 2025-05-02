import { PROGRAMS } from "../../constants/subjects";
import { Filters } from "../types";
import { resetFilters } from "./utils";
interface FilterSidebarProps {
  setSearchTerm: (term: string) => void;
  setProfessorSearchTerm: (term: string) => void;
  setAssistantSearchTerm: (term: string) => void;
  setFilters: (filters: (prev: Filters) => Filters) => void;
  filters: Filters;
}

const FilterSidebar = ({
  setSearchTerm,
  setProfessorSearchTerm,
  setAssistantSearchTerm,
  setFilters,
  filters,
}: FilterSidebarProps) => {
  return (
    <div className="">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Филтри</h2>
        <button
          onClick={() =>
            resetFilters(
              setSearchTerm,
              setProfessorSearchTerm,
              setAssistantSearchTerm,
              setFilters
            )
          }
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Избриши
        </button>
      </div>
      <div className="mb-4">
        {/* filter by season*/}
        <div className="space-y-1 mb-4">
          <h3 className="font-medium mb-2">Семестар</h3>
          <div className="grid grid-cols-2">
            {["Летен", "Зимски"].map((season) => {
              const seasonValue = season === "Летен" ? "S" : "W";
              return (
                <div key={season} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="season"
                    id={seasonValue}
                    onChange={() =>
                      setFilters((prev) => ({
                        ...prev,
                        season: prev.season === seasonValue ? "" : seasonValue,
                      }))
                    }
                    checked={filters.season === seasonValue}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <label
                    htmlFor={seasonValue}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {season}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* filter by semester*/}
        <div className="space-y-1 mb-4">
          {/* <h3 className="font-medium mb-2">Семестар</h3> */}
          <div className="grid grid-cols-4 gap-2">
            {Array.from(Array(8)).map((_, index) => {
              const i = index + 1;
              return (
                <div key={i} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="season"
                    id={`s${i}`}
                    onChange={() =>
                      setFilters((prev) => ({
                        ...prev,
                        semester: prev.semester.includes(i)
                          ? prev.semester.filter((item) => item !== i)
                          : [...prev.semester, i],
                      }))
                    }
                    checked={filters.semester.includes(i)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <label htmlFor={`s${i}`} className="text-sm text-gray-700">
                    {i}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
        {/* filter by level */}
        <div className="space-y-1 mb-4">
          <h3 className="font-medium mb-2">Ниво</h3>
          <div className="grid grid-cols-3">
            {Array.from(Array(3)).map((_, index) => {
              const i = index + 1;
              const level = `L${i}`;
              return (
                <div key={i} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="level"
                    id={level}
                    onChange={() =>
                      setFilters((prev) => ({
                        ...prev,
                        level: prev.level.includes(i)
                          ? prev.level.filter((item) => item !== i)
                          : [...prev.level, i],
                      }))
                    }
                    checked={filters.level.includes(i)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <label
                    htmlFor={`s${level}`}
                    className="text-sm text-gray-700"
                  >
                    {level}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
        {/* filter by activation*/}
        <div className="space-y-1 mb-4">
          <h3 className="font-medium mb-2">Активирани</h3>
          <div className="grid grid-cols-2">
            {["Активирани", "Неактивирани"].map((value) => {
              const activeValue =
                value === "Активирани" ? "activated" : "not_activated";
              return (
                <div key={activeValue} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="season"
                    id={activeValue}
                    onChange={() =>
                      setFilters((prev) => ({
                        ...prev,
                        activated:
                          prev.activated === activeValue ? "" : activeValue,
                      }))
                    }
                    checked={filters.activated === activeValue}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <label
                    htmlFor={activeValue}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {value}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
        {/* filter by mandatoryFor */}
        <div className="space-y-1 mb-4">
          <h3 className="font-medium mb-2">Задолжителен за:</h3>
          <div className="grid grid-cols-3 gap-2">
            {PROGRAMS.map((program) => {
              const programName = program.replace(/\d+$/, "");
              return (
                <div key={program} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="level"
                    id={program}
                    onChange={() =>
                      setFilters((prev) => ({
                        ...prev,
                        mandatoryFor: prev.mandatoryFor.includes(program)
                          ? prev.mandatoryFor.filter((item) => item !== program)
                          : [...prev.mandatoryFor, program],
                      }))
                    }
                    checked={filters.mandatoryFor.includes(program)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <label
                    htmlFor={`s${program}`}
                    className="text-sm text-gray-700"
                  >
                    {programName}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
        {/* filter by electiveFor */}
        <div className="space-y-1 mb-6">
          <h3 className="font-medium mb-2">Изборен за:</h3>
          <div className="grid grid-cols-3 gap-2">
            {PROGRAMS.map((program) => {
              const programName = program.replace(/\d+$/, "");
              return (
                <div key={program} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="level"
                    id={program}
                    onChange={() =>
                      setFilters((prev) => ({
                        ...prev,
                        electiveFor: prev.electiveFor.includes(program)
                          ? prev.electiveFor.filter((item) => item !== program)
                          : [...prev.electiveFor, program],
                      }))
                    }
                    checked={filters.electiveFor.includes(program)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <label
                    htmlFor={`s${program}`}
                    className="text-sm text-gray-700"
                  >
                    {programName}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
        {/* filter by prereq */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="prereq"
              id="prereq"
              onChange={() =>
                setFilters((prev) => ({
                  ...prev,
                  hasPrerequisites: !prev.hasPrerequisites,
                }))
              }
              checked={filters.hasPrerequisites}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <label htmlFor={"prereq"} className="text-sm text-gray-700">
              Предметот нема предуслови
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
