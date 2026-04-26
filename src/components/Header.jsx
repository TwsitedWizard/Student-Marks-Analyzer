import useStore from "../store/useStore";

export default function Header() {
  const { darkMode, toggleDarkMode, currentPage, selectedStudent, dataSource, resetToMockData } = useStore();

  const getTitle = () => {
    switch (currentPage) {
      case "dashboard": return "Dashboard Overview";
      case "students": return "Student Directory";
      case "student-detail": return selectedStudent?.name || "Student Analytics";
      case "upload": return "Upload Data";
      case "reports": return "Reports & Export";
      default: return "Dashboard";
    }
  };

  const getSubtitle = () => {
    switch (currentPage) {
      case "dashboard": return "Class-wide performance metrics and trends";
      case "students": return "Browse and search all student records";
      case "student-detail": return "Detailed performance breakdown and insights";
      case "upload": return "Import student performance data from CSV or Excel";
      case "reports": return "Export and download performance data";
      default: return "";
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 px-6 py-4 flex items-center justify-between transition-colors duration-300 backdrop-blur-md ${
        darkMode
          ? "bg-surface-dark/80 border-b border-border-dark"
          : "bg-surface-light/80 border-b border-border-light"
      }`}
    >
      <div>
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
        <p className={`text-sm mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
          {getSubtitle()}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Data source indicator */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            dataSource === "uploaded"
              ? darkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
              : darkMode ? "bg-surface-hover-dark text-gray-500" : "bg-gray-100 text-gray-400"
          }`}>
            {dataSource === "uploaded" ? "📂 Uploaded Data" : "📋 Sample Data"}
          </span>
          {dataSource === "uploaded" && (
            <button
              id="reset-to-mock"
              onClick={resetToMockData}
              title="Reset to sample data"
              className={`p-1.5 rounded-lg text-xs transition-all duration-200 ${
                darkMode ? "text-gray-500 hover:bg-surface-hover-dark hover:text-gray-300" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              }`}
            >
              ↩
            </button>
          )}
        </div>

        {/* Dark/Light Mode Toggle */}
        <button
          id="theme-toggle"
          onClick={toggleDarkMode}
          className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
            darkMode ? "bg-primary-600" : "bg-gray-300"
          }`}
          aria-label="Toggle theme"
        >
          <span
            className={`absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center text-xs ${
              darkMode
                ? "left-7 bg-surface-dark"
                : "left-0.5 bg-white shadow-md"
            }`}
          >
            {darkMode ? "🌙" : "☀️"}
          </span>
        </button>

        {/* Profile avatar placeholder */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
          darkMode
            ? "bg-gradient-to-br from-primary-500 to-accent-cyan text-white"
            : "bg-gradient-to-br from-primary-400 to-primary-600 text-white"
        }`}>
          A
        </div>
      </div>
    </header>
  );
}
