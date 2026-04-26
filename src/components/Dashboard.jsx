import { useMemo } from "react";
import useStore from "../store/useStore";
import { subjects } from "../data/students";
import { getClassAnalytics, getOverallAverage, getHeatmapData } from "../utils/analytics";
import { PerformanceLineChart } from "./Charts";
import MetricCard from "./MetricCard";

function HeatmapCell({ value, darkMode }) {
  const getColor = (v) => {
    if (v >= 85) return "bg-emerald-500";
    if (v >= 70) return "bg-emerald-400/70";
    if (v >= 60) return "bg-amber-400/80";
    if (v >= 50) return "bg-orange-400/80";
    return "bg-rose-500/80";
  };

  return (
    <div
      className={`w-full h-8 rounded-md flex items-center justify-center text-xs font-semibold text-white transition-all duration-200 hover:scale-110 cursor-default ${getColor(value)}`}
      title={`${value}%`}
    >
      {value}
    </div>
  );
}

export default function Dashboard() {
  const { students, darkMode, setSelectedStudent, dataVersion } = useStore();
  const analytics = useMemo(() => getClassAnalytics(students), [students]);
  const heatmapData = useMemo(() => getHeatmapData(students), [students]);

  return (
    <div key={`dashboard-${dataVersion}`} className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Class Average"
          value={`${analytics.classAverage.toFixed(1)}%`}
          subtitle="Across all subjects"
          icon="📊"
          color="indigo"
          delay={0}
        />
        <MetricCard
          title="Top Performer"
          value={analytics.topStudent.student.name}
          subtitle={`${analytics.topStudent.average.toFixed(1)}% average`}
          icon="🏆"
          color="amber"
          delay={50}
          trend="up"
        />
        <MetricCard
          title="Needs Support"
          value={analytics.lowestStudent.student.name}
          subtitle={`${analytics.lowestStudent.average.toFixed(1)}% average`}
          icon="📉"
          color="rose"
          delay={100}
          trend="down"
        />
        <MetricCard
          title="Total Students"
          value={students.length}
          subtitle="Active enrollments"
          icon="👥"
          color="cyan"
          delay={150}
        />
      </div>

      {/* Subject Averages */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {analytics.subjectAverages.map((subject, i) => (
          <div
            key={subject.key}
            className={`animate-fade-in-up rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] ${
              darkMode
                ? "bg-surface-card-dark border border-border-dark"
                : "bg-surface-card-light border border-border-light shadow-sm"
            }`}
            style={{ animationDelay: `${i * 50 + 200}ms` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
              <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {subject.name}
              </span>
            </div>
            <p className="text-2xl font-bold">{subject.average.toFixed(1)}%</p>
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: darkMode ? '#2a2e3d' : '#e2e8f0' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${subject.average}%`, backgroundColor: subject.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Class Performance Chart */}
      <div
        className={`animate-fade-in-up rounded-2xl p-6 transition-all duration-300 ${
          darkMode
            ? "bg-surface-card-dark border border-border-dark"
            : "bg-surface-card-light border border-border-light shadow-sm"
        }`}
        style={{ animationDelay: "300ms" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">Class Performance Trend</h2>
            <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              Average scores per subject across all weeks
            </p>
          </div>
        </div>
        <PerformanceLineChart data={analytics.weeklySubjectData} height={320} />
      </div>

      {/* Top 3 Students + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 3 */}
        <div
          className={`animate-fade-in-up rounded-2xl p-6 transition-all duration-300 ${
            darkMode
              ? "bg-surface-card-dark border border-border-dark"
              : "bg-surface-card-light border border-border-light shadow-sm"
          }`}
          style={{ animationDelay: "400ms" }}
        >
          <h2 className="text-lg font-bold mb-4">🏅 Top Performers</h2>
          <div className="space-y-3">
            {analytics.studentAverages.slice(0, 3).map((item, i) => {
              const medals = ["🥇", "🥈", "🥉"];
              const borderColors = ["border-amber-400", "border-gray-400", "border-amber-700"];
              return (
                <button
                  key={item.student.id}
                  id={`top-student-${i + 1}`}
                  onClick={() => setSelectedStudent(item.student)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] border-l-4 ${borderColors[i]} ${
                    darkMode
                      ? "bg-surface-hover-dark/50 hover:bg-surface-hover-dark"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-2xl">{medals[i]}</span>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{item.student.name}</p>
                    <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {item.student.rollNo}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-400">{item.average.toFixed(1)}%</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Heatmap */}
        <div
          className={`animate-fade-in-up rounded-2xl p-6 transition-all duration-300 ${
            darkMode
              ? "bg-surface-card-dark border border-border-dark"
              : "bg-surface-card-light border border-border-light shadow-sm"
          }`}
          style={{ animationDelay: "450ms" }}
        >
          <h2 className="text-lg font-bold mb-4">🔥 Weekly Performance Heatmap</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className={`text-left py-2 pr-3 text-xs font-semibold ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    Student
                  </th>
                  {["W1", "W2", "W3", "W4"].map((w) => (
                    <th key={w} className={`text-center py-2 px-2 text-xs font-semibold ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {w}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row) => (
                  <tr key={row.name}>
                    <td className={`py-1.5 pr-3 text-xs font-medium truncate max-w-[120px] ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {row.name}
                    </td>
                    {row.weeks.map((val, j) => (
                      <td key={j} className="py-1.5 px-1">
                        <HeatmapCell value={val} darkMode={darkMode} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 justify-center">
            {[
              { label: "< 50", cls: "bg-rose-500/80" },
              { label: "50-59", cls: "bg-orange-400/80" },
              { label: "60-69", cls: "bg-amber-400/80" },
              { label: "70-84", cls: "bg-emerald-400/70" },
              { label: "85+", cls: "bg-emerald-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <span className={`w-3 h-3 rounded-sm ${item.cls}`} />
                <span className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
