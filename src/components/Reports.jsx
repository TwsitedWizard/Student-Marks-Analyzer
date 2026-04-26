import useStore from "../store/useStore";
import { exportToCSV, exportToExcel } from "../utils/exportUtils";

export default function Reports() {
  const { students, darkMode, dataSource } = useStore();

  const handleExportExcel = () => {
    console.log("[EduAnalytics] Export Excel triggered — students:", students.length, "source:", dataSource);
    exportToExcel(students, "Student_Performance_Report");
  };

  const handleExportCSV = () => {
    console.log("[EduAnalytics] Export CSV triggered — students:", students.length, "source:", dataSource);
    exportToCSV(students, "Student_Performance_Report");
  };

  const actions = [
    {
      id: "export-all-xlsx",
      title: "Export Full Report (Excel)",
      description: `Download complete performance data for all ${students.length} students in .xlsx format with 3 sheets: raw data, analytics summary, and class overview.`,
      icon: "📊",
      color: "from-emerald-500 to-emerald-700",
      buttonText: "Download .xlsx",
      onClick: handleExportExcel,
    },
    {
      id: "export-all-csv",
      title: "Export Full Report (CSV)",
      description: `Download the full dataset (${students.length * 4} rows) in CSV — compatible with Excel, Google Sheets, and data pipelines.`,
      icon: "📄",
      color: "from-cyan-500 to-cyan-700",
      buttonText: "Download .csv",
      onClick: handleExportCSV,
    },
  ];

  const stats = [
    { label: "Total Students", value: students.length, icon: "👥" },
    { label: "Subjects Tracked", value: 4, icon: "📚" },
    { label: "Weeks of Data", value: 4, icon: "📅" },
    { label: "Data Points", value: students.length * 16, icon: "📈" },
  ];

  return (
    <div className="space-y-6">
      {/* Data source indicator */}
      <div
        className={`animate-fade-in-up flex items-center gap-3 rounded-2xl p-4 ${
          dataSource === "uploaded"
            ? darkMode
              ? "bg-emerald-500/10 border border-emerald-500/30"
              : "bg-emerald-50 border border-emerald-200"
            : darkMode
            ? "bg-surface-card-dark border border-border-dark"
            : "bg-surface-card-light border border-border-light shadow-sm"
        }`}
      >
        <span className="text-xl">{dataSource === "uploaded" ? "📂" : "📋"}</span>
        <div>
          <p className="font-semibold text-sm">
            {dataSource === "uploaded"
              ? `Exporting uploaded data — ${students.length} students`
              : `Exporting sample data — ${students.length} students`}
          </p>
          <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            {dataSource === "uploaded"
              ? "Your uploaded dataset will be exported."
              : "Upload your own data to export real student records."}
          </p>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`animate-fade-in-up rounded-xl p-5 text-center transition-all duration-300 hover:scale-[1.02] ${
              darkMode
                ? "bg-surface-card-dark border border-border-dark"
                : "bg-surface-card-light border border-border-light shadow-sm"
            }`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-2xl font-extrabold mt-2">{stat.value}</p>
            <p className={`text-xs font-medium mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actions.map((action, i) => (
          <div
            key={action.id}
            className={`animate-fade-in-up rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
              darkMode
                ? "bg-surface-card-dark border border-border-dark hover:border-primary-600/30"
                : "bg-surface-card-light border border-border-light shadow-sm hover:shadow-lg"
            }`}
            style={{ animationDelay: `${(i + 4) * 50}ms` }}
          >
            {/* Gradient header */}
            <div className={`h-2 bg-gradient-to-r ${action.color}`} />
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-lg`}>
                  <span className="text-white text-xl">{action.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{action.title}</h3>
                  <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {action.description}
                  </p>
                </div>
              </div>
              <button
                id={action.id}
                onClick={action.onClick}
                disabled={students.length === 0}
                className={`mt-5 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg ${
                  students.length === 0
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : darkMode
                    ? "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-600/25"
                    : "bg-primary-500 text-white hover:bg-primary-600 hover:shadow-primary-500/25"
                }`}
              >
                {students.length === 0 ? "No data to export" : action.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div
        className={`animate-fade-in-up rounded-2xl p-6 ${
          darkMode
            ? "bg-surface-card-dark border border-border-dark"
            : "bg-surface-card-light border border-border-light shadow-sm"
        }`}
        style={{ animationDelay: "350ms" }}
      >
        <h3 className="text-lg font-bold mb-3">📋 Report Information</h3>
        <div className={`space-y-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          <p>
            <strong className={darkMode ? "text-gray-300" : "text-gray-700"}>Excel (.xlsx) — 3 sheets:</strong>{" "}
            <strong>Sheet 1:</strong> Full flat data (re-importable). <strong>Sheet 2:</strong> Analytics summary per student. <strong>Sheet 3:</strong> Class overview (avg, top/bottom performer).
          </p>
          <p>
            <strong className={darkMode ? "text-gray-300" : "text-gray-700"}>CSV:</strong>{" "}
            Universal comma-separated format with one row per subject per student. Compatible with Python, R, Excel, and Google Sheets.
          </p>
          <p className={`pt-2 border-t ${darkMode ? "border-border-dark" : "border-border-light"}`}>
            <strong className={darkMode ? "text-gray-300" : "text-gray-700"}>💡 Tip:</strong>{" "}
            You can also export individual student reports from the Student Analytics page. Just click on any student and use the export buttons in their profile.
          </p>
        </div>
      </div>
    </div>
  );
}
