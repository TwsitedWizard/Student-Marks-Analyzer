import { useMemo } from "react";
import useStore from "../store/useStore";
import { subjects } from "../data/students";
import {
  getOverallAverage, getBestSubject, getWeakestSubject, getOverallTrend,
  getSubjectAverage, getSubjectTrend, getStudentChartData, getRadarData,
  getBarData, generateInsights,
} from "../utils/analytics";
import { PerformanceLineChart, PerformanceRadarChart, PerformanceBarChart } from "./Charts";
import { exportStudentReport, exportStudentCSV } from "../utils/exportUtils";

function InsightBadge({ type, text }) {
  const darkMode = useStore((s) => s.darkMode);
  const config = {
    success: {
      icon: "✅",
      border: darkMode ? "border-emerald-500/30" : "border-emerald-300",
      bg: darkMode ? "bg-emerald-500/10" : "bg-emerald-50",
      text: darkMode ? "text-emerald-300" : "text-emerald-700",
    },
    warning: {
      icon: "⚠️",
      border: darkMode ? "border-amber-500/30" : "border-amber-300",
      bg: darkMode ? "bg-amber-500/10" : "bg-amber-50",
      text: darkMode ? "text-amber-300" : "text-amber-700",
    },
    danger: {
      icon: "🔴",
      border: darkMode ? "border-rose-500/30" : "border-rose-300",
      bg: darkMode ? "bg-rose-500/10" : "bg-rose-50",
      text: darkMode ? "text-rose-300" : "text-rose-700",
    },
  };
  const c = config[type] || config.warning;
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${c.border} ${c.bg}`}>
      <span className="text-lg mt-0.5 flex-shrink-0">{c.icon}</span>
      <p className={`text-sm ${c.text}`}>{text}</p>
    </div>
  );
}

export default function StudentDetail() {
  const { selectedStudent, darkMode, setCurrentPage, dataVersion } = useStore();

  const data = useMemo(() => {
    if (!selectedStudent) return null;
    return {
      avg: getOverallAverage(selectedStudent),
      best: getBestSubject(selectedStudent),
      weakest: getWeakestSubject(selectedStudent),
      trend: getOverallTrend(selectedStudent),
      chartData: getStudentChartData(selectedStudent),
      radarData: getRadarData(selectedStudent),
      barData: getBarData(selectedStudent),
      insights: generateInsights(selectedStudent),
      subjectDetails: subjects.map((s) => ({
        ...s,
        average: getSubjectAverage(selectedStudent, s.key),
        trend: getSubjectTrend(selectedStudent, s.key),
      })),
    };
  }, [selectedStudent, dataVersion]);

  if (!selectedStudent || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className={darkMode ? "text-gray-500" : "text-gray-400"}>No student selected</p>
      </div>
    );
  }

  const trendIcon = (trend) => {
    if (trend.includes("Improving")) return { icon: "📈", color: "text-emerald-400" };
    if (trend.includes("Declining")) return { icon: "📉", color: "text-rose-400" };
    return { icon: "➡️", color: "text-gray-400" };
  };

  const { icon: trendEmoji, color: trendColor } = trendIcon(data.trend);

  return (
    <div className="space-y-6">
      {/* Back button + Student Header */}
      <div className="animate-fade-in-up flex items-center gap-4">
        <button
          id="back-to-students"
          onClick={() => setCurrentPage("students")}
          className={`p-2 rounded-xl transition-all duration-200 ${
            darkMode
              ? "hover:bg-surface-hover-dark text-gray-400 hover:text-white"
              : "hover:bg-gray-100 text-gray-500 hover:text-gray-800"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
              darkMode
                ? "bg-gradient-to-br from-primary-500 to-primary-700 text-white"
                : "bg-gradient-to-br from-primary-400 to-primary-600 text-white"
            }`}>
              {selectedStudent.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{selectedStudent.name}</h2>
              <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                {selectedStudent.rollNo}
              </p>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <button
            id="export-student-xlsx"
            onClick={() => exportStudentReport(selectedStudent)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-all duration-200 hover:shadow-lg hover:shadow-primary-600/25"
          >
            📥 Excel
          </button>
          <button
            id="export-student-csv"
            onClick={() => exportStudentCSV(selectedStudent)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              darkMode
                ? "bg-surface-hover-dark text-gray-300 hover:bg-border-dark"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            📄 CSV
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`animate-fade-in-up rounded-xl p-4 text-center ${
          darkMode ? "bg-surface-card-dark border border-border-dark" : "bg-surface-card-light border border-border-light shadow-sm"
        }`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Overall Average</p>
          <p className="text-3xl font-extrabold">{data.avg.toFixed(1)}%</p>
        </div>
        <div className={`animate-fade-in-up rounded-xl p-4 text-center stagger-1 ${
          darkMode ? "bg-surface-card-dark border border-border-dark" : "bg-surface-card-light border border-border-light shadow-sm"
        }`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Best Subject</p>
          <p className="text-lg font-bold">{data.best.name}</p>
          <p className="text-sm text-emerald-400">{getSubjectAverage(selectedStudent, data.best.key).toFixed(1)}%</p>
        </div>
        <div className={`animate-fade-in-up rounded-xl p-4 text-center stagger-2 ${
          darkMode ? "bg-surface-card-dark border border-border-dark" : "bg-surface-card-light border border-border-light shadow-sm"
        }`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Weakest Subject</p>
          <p className="text-lg font-bold">{data.weakest.name}</p>
          <p className="text-sm text-rose-400">{getSubjectAverage(selectedStudent, data.weakest.key).toFixed(1)}%</p>
        </div>
        <div className={`animate-fade-in-up rounded-xl p-4 text-center stagger-3 ${
          darkMode ? "bg-surface-card-dark border border-border-dark" : "bg-surface-card-light border border-border-light shadow-sm"
        }`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Trend</p>
          <p className="text-2xl">{trendEmoji}</p>
          <p className={`text-sm font-semibold ${trendColor}`}>{data.trend}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className={`animate-fade-in-up rounded-2xl p-6 ${
          darkMode ? "bg-surface-card-dark border border-border-dark" : "bg-surface-card-light border border-border-light shadow-sm"
        }`}>
          <h3 className="text-lg font-bold mb-1">Weekly Performance</h3>
          <p className={`text-sm mb-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Subject-wise marks across weeks</p>
          <PerformanceLineChart data={data.chartData} height={280} />
        </div>

        {/* Radar Chart */}
        <div className={`animate-fade-in-up rounded-2xl p-6 stagger-1 ${
          darkMode ? "bg-surface-card-dark border border-border-dark" : "bg-surface-card-light border border-border-light shadow-sm"
        }`}>
          <h3 className="text-lg font-bold mb-1">Subject Comparison</h3>
          <p className={`text-sm mb-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Radar view of average performance</p>
          <PerformanceRadarChart data={data.radarData} height={280} />
        </div>
      </div>

      {/* Bar Chart + Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className={`animate-fade-in-up rounded-2xl p-6 ${
          darkMode ? "bg-surface-card-dark border border-border-dark" : "bg-surface-card-light border border-border-light shadow-sm"
        }`}>
          <h3 className="text-lg font-bold mb-1">Average per Subject</h3>
          <p className={`text-sm mb-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Bar comparison of subjects</p>
          <PerformanceBarChart data={data.barData} height={280} />
        </div>

        {/* Subject Details */}
        <div className={`animate-fade-in-up rounded-2xl p-6 stagger-1 ${
          darkMode ? "bg-surface-card-dark border border-border-dark" : "bg-surface-card-light border border-border-light shadow-sm"
        }`}>
          <h3 className="text-lg font-bold mb-4">Subject Breakdown</h3>
          <div className="space-y-4">
            {data.subjectDetails.map((s) => {
              const t = trendIcon(s.trend);
              return (
                <div key={s.key} className={`p-3 rounded-xl ${
                  darkMode ? "bg-surface-hover-dark/50" : "bg-gray-50"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="font-semibold text-sm">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${t.color}`}>{s.trend}</span>
                      <span className="text-sm">{t.icon}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: darkMode ? '#2a2e3d' : '#e2e8f0' }}>
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${s.average}%`, backgroundColor: s.color }}
                      />
                    </div>
                    <span className="text-sm font-bold w-14 text-right">{s.average.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Smart Insights */}
      <div className={`animate-fade-in-up rounded-2xl p-6 ${
        darkMode ? "bg-surface-card-dark border border-border-dark" : "bg-surface-card-light border border-border-light shadow-sm"
      }`}>
        <h3 className="text-lg font-bold mb-1">🧠 Smart Insights</h3>
        <p className={`text-sm mb-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
          AI-generated analysis and recommendations
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {data.insights.insights.map((insight, i) => (
            <InsightBadge key={i} type={insight.type} text={insight.text} />
          ))}
        </div>

        <div>
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span>💡</span> Actionable Suggestions
          </h4>
          <div className="space-y-2">
            {data.insights.suggestions.map((suggestion, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl ${
                  darkMode ? "bg-surface-hover-dark/50" : "bg-gray-50"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                  darkMode ? "bg-primary-600/30 text-primary-400" : "bg-primary-100 text-primary-600"
                }`}>
                  {i + 1}
                </span>
                <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
