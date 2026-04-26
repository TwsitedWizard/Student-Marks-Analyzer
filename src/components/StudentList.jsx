import { useMemo, useState } from "react";
import useStore from "../store/useStore";
import { subjects } from "../data/students";
import { getOverallAverage, getBestSubject, getWeakestSubject } from "../utils/analytics";

export default function StudentList() {
  const { students, darkMode, setSelectedStudent, searchQuery, setSearchQuery, subjectFilter, setSubjectFilter, performanceFilter, setPerformanceFilter } = useStore();
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const enrichedStudents = useMemo(() => {
    return students.map((s) => ({
      ...s,
      avgScore: getOverallAverage(s),
      bestSubject: getBestSubject(s),
      weakestSubject: getWeakestSubject(s),
    }));
  }, [students]);

  const filteredStudents = useMemo(() => {
    let list = [...enrichedStudents];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q)
      );
    }

    // Performance filter
    if (performanceFilter === "excellent") {
      list = list.filter((s) => s.avgScore > 80);
    } else if (performanceFilter === "good") {
      list = list.filter((s) => s.avgScore >= 60 && s.avgScore <= 80);
    } else if (performanceFilter === "needs-improvement") {
      list = list.filter((s) => s.avgScore < 60);
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "rollNo":
          cmp = a.rollNo.localeCompare(b.rollNo);
          break;
        case "avgScore":
          cmp = a.avgScore - b.avgScore;
          break;
        case "bestSubject":
          cmp = a.bestSubject.name.localeCompare(b.bestSubject.name);
          break;
        case "weakestSubject":
          cmp = a.weakestSubject.name.localeCompare(b.weakestSubject.name);
          break;
        default:
          cmp = 0;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [enrichedStudents, searchQuery, performanceFilter, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="opacity-30 ml-1">↕</span>;
    return <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const getScoreBadge = (score) => {
    if (score > 80) return { text: "Excellent", cls: "bg-emerald-500/20 text-emerald-400" };
    if (score >= 60) return { text: "Good", cls: "bg-amber-500/20 text-amber-400" };
    return { text: "Low", cls: "bg-rose-500/20 text-rose-400" };
  };

  // Find top 3 student IDs
  const top3Ids = useMemo(() => {
    const sorted = [...enrichedStudents].sort((a, b) => b.avgScore - a.avgScore);
    return new Set(sorted.slice(0, 3).map((s) => s.id));
  }, [enrichedStudents]);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div
        className={`animate-fade-in-up flex flex-wrap items-center gap-4 rounded-2xl p-4 ${
          darkMode
            ? "bg-surface-card-dark border border-border-dark"
            : "bg-surface-card-light border border-border-light shadow-sm"
        }`}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="student-search"
            type="text"
            placeholder="Search by name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none ${
              darkMode
                ? "bg-surface-hover-dark border border-border-dark text-gray-200 placeholder-gray-600 focus:border-primary-500"
                : "bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-primary-400"
            }`}
          />
        </div>

        {/* Performance Filter */}
        <select
          id="performance-filter"
          value={performanceFilter}
          onChange={(e) => setPerformanceFilter(e.target.value)}
          className={`px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer transition-all duration-200 ${
            darkMode
              ? "bg-surface-hover-dark border border-border-dark text-gray-200 focus:border-primary-500"
              : "bg-gray-50 border border-gray-200 text-gray-700 focus:border-primary-400"
          }`}
        >
          <option value="all">All Performance</option>
          <option value="excellent">Excellent (&gt;80%)</option>
          <option value="good">Good (60-80%)</option>
          <option value="needs-improvement">Needs Improvement (&lt;60%)</option>
        </select>

        <span className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
          {filteredStudents.length} students
        </span>
      </div>

      {/* Table */}
      <div
        className={`animate-fade-in-up rounded-2xl overflow-hidden transition-all duration-300 ${
          darkMode
            ? "bg-surface-card-dark border border-border-dark"
            : "bg-surface-card-light border border-border-light shadow-sm"
        }`}
        style={{ animationDelay: "100ms" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={darkMode ? "bg-surface-hover-dark/50" : "bg-gray-50"}>
                {[
                  { key: "name", label: "Name" },
                  { key: "rollNo", label: "Roll No" },
                  { key: "avgScore", label: "Avg Score" },
                  { key: "bestSubject", label: "Best Subject" },
                  { key: "weakestSubject", label: "Weakest Subject" },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className={`text-left px-5 py-4 font-semibold text-xs uppercase tracking-wider cursor-pointer select-none transition-colors hover:text-primary-400 ${
                      darkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {label}
                    <SortIcon field={key} />
                  </th>
                ))}
                <th className={`text-left px-5 py-4 font-semibold text-xs uppercase tracking-wider ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, i) => {
                const badge = getScoreBadge(student.avgScore);
                const isTop3 = top3Ids.has(student.id);
                return (
                  <tr
                    key={student.id}
                    id={`student-row-${student.id}`}
                    onClick={() => setSelectedStudent(student)}
                    className={`cursor-pointer transition-all duration-200 ${
                      isTop3
                        ? darkMode
                          ? "bg-primary-600/5 hover:bg-primary-600/10"
                          : "bg-primary-50/50 hover:bg-primary-50"
                        : darkMode
                        ? "hover:bg-surface-hover-dark"
                        : "hover:bg-surface-hover-light"
                    } ${
                      darkMode ? "border-t border-border-dark" : "border-t border-border-light"
                    }`}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-5 py-4 font-medium flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        darkMode
                          ? "bg-primary-600/20 text-primary-400"
                          : "bg-primary-100 text-primary-600"
                      }`}>
                        {student.name.charAt(0)}
                      </div>
                      <span>{student.name}</span>
                      {isTop3 && <span className="text-amber-400 text-xs">⭐</span>}
                    </td>
                    <td className={`px-5 py-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {student.rollNo}
                    </td>
                    <td className="px-5 py-4 font-bold">{student.avgScore.toFixed(1)}%</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: student.bestSubject.color }} />
                        {student.bestSubject.name}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: student.weakestSubject.color }} />
                        {student.weakestSubject.name}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
                        {badge.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <p className={`text-lg font-medium ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      No students found
                    </p>
                    <p className={`text-sm mt-1 ${darkMode ? "text-gray-600" : "text-gray-300"}`}>
                      Try adjusting your search or filters
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
