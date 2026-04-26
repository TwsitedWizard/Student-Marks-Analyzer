import useStore from "./store/useStore";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import StudentList from "./components/StudentList";
import StudentDetail from "./components/StudentDetail";
import DataUpload from "./components/DataUpload";
import Reports from "./components/Reports";

function App() {
  const darkMode = useStore((s) => s.darkMode);
  const currentPage = useStore((s) => s.currentPage);
  const sidebarOpen = useStore((s) => s.sidebarOpen);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "students":
        return <StudentList />;
      case "student-detail":
        return <StudentDetail />;
      case "upload":
        return <DataUpload />;
      case "reports":
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={darkMode ? "dark" : "light"}>
      <div
        className={`flex min-h-screen transition-colors duration-300 ${
          darkMode ? "bg-surface-dark text-gray-100" : "bg-surface-light text-gray-900"
        }`}
      >
        <Sidebar />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-20"
          }`}
        >
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            {renderPage()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
