import { create } from "zustand";
import { students as defaultStudents } from "../data/students";

// ─── localStorage helpers ───
const STORAGE_KEY = "eduanalytics_data";

function loadPersistedData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.students) && parsed.students.length > 0) {
        return { students: parsed.students, dataSource: "uploaded", dataVersion: parsed.dataVersion || 1 };
      }
    }
  } catch { /* ignore corrupt data */ }
  return null;
}

function persistData(students, dataVersion) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ students, dataVersion }));
  } catch { /* ignore quota errors */ }
}

function clearPersistedData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

// ─── Initial state ───
const persisted = loadPersistedData();

const useStore = create((set, get) => ({
  // Student data — loads from localStorage if available, else mock
  students: persisted ? persisted.students : defaultStudents,
  dataSource: persisted ? "uploaded" : "mock",
  dataVersion: persisted ? persisted.dataVersion : 0,

  setStudents: (data) => {
    const nextVersion = get().dataVersion + 1;
    // Persist to localStorage
    persistData(data, nextVersion);
    set({
      students: data,
      dataSource: "uploaded",
      dataVersion: nextVersion,
      selectedStudent: null,
      // Reset filters/search to prevent stale state from hiding new students
      searchQuery: "",
      performanceFilter: "all",
      subjectFilter: "all",
    });
    console.log(`[EduAnalytics] Data updated — ${data.length} students loaded (v${nextVersion})`);
  },

  resetToMockData: () => {
    clearPersistedData();
    set({
      students: defaultStudents,
      dataSource: "mock",
      dataVersion: 0,
      selectedStudent: null,
      searchQuery: "",
      performanceFilter: "all",
      subjectFilter: "all",
    });
    console.log("[EduAnalytics] Reset to sample data");
  },

  // Theme
  darkMode: true,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  // Navigation
  currentPage: "dashboard",
  setCurrentPage: (page) => set({ currentPage: page, selectedStudent: null }),

  // Selected student
  selectedStudent: null,
  setSelectedStudent: (student) =>
    set({ selectedStudent: student, currentPage: "student-detail" }),

  // Filters
  subjectFilter: "all",
  setSubjectFilter: (filter) => set({ subjectFilter: filter }),
  performanceFilter: "all",
  setPerformanceFilter: (filter) => set({ performanceFilter: filter }),

  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Search
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
}));

export default useStore;
