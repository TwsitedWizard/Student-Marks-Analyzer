import useStore from "../store/useStore";

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: "students",
    label: "Students",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    id: "upload",
    label: "Upload Data",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    id: "reports",
    label: "Reports",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const { darkMode, currentPage, setCurrentPage, sidebarOpen, toggleSidebar } = useStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 flex flex-col ${
        sidebarOpen ? "w-64" : "w-20"
      } ${
        darkMode
          ? "bg-surface-card-dark border-r border-border-dark"
          : "bg-surface-card-light border-r border-border-light shadow-lg"
      }`}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-opacity-20"
        style={{ borderColor: darkMode ? '#2a2e3d' : '#e2e8f0' }}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        {sidebarOpen && (
          <div className="animate-fade-in-up">
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary-400 to-accent-cyan bg-clip-text text-transparent">
              EduAnalytics
            </h1>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Performance Tracker</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.id || (item.id === "students" && currentPage === "student-detail");
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? darkMode
                    ? "bg-primary-600/20 text-primary-400 shadow-lg shadow-primary-600/10"
                    : "bg-primary-50 text-primary-600 shadow-md shadow-primary-100"
                  : darkMode
                  ? "text-gray-400 hover:bg-surface-hover-dark hover:text-gray-200"
                  : "text-gray-600 hover:bg-surface-hover-light hover:text-gray-900"
              }`}
            >
              <span className={`transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                {item.icon}
              </span>
              {sidebarOpen && <span>{item.label}</span>}
              {isActive && sidebarOpen && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse-glow" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-4 border-t" style={{ borderColor: darkMode ? '#2a2e3d' : '#e2e8f0' }}>
        <button
          id="toggle-sidebar"
          onClick={toggleSidebar}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
            darkMode
              ? "text-gray-400 hover:bg-surface-hover-dark hover:text-gray-200"
              : "text-gray-500 hover:bg-surface-hover-light hover:text-gray-700"
          }`}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${sidebarOpen ? "" : "rotate-180"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          {sidebarOpen && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
