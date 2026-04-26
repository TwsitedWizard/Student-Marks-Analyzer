import { useState, useRef, useCallback } from "react";
import useStore from "../store/useStore";
import { readFile, parseStudentData, downloadSampleCSV, generateSampleExcel } from "../utils/dataParser";
import { subjects, weekLabels } from "../data/students";
import { getSubjectAverage, getOverallAverage } from "../utils/analytics";

// ───────────── Upload states ─────────────
const IDLE = "idle";
const PARSING = "parsing";
const PREVIEW = "preview";
const ERROR_STATE = "error";
const SUCCESS = "success";

export default function DataUpload() {
  const { darkMode, setStudents, setCurrentPage } = useStore();
  const fileInputRef = useRef(null);

  const [uploadState, setUploadState] = useState(IDLE);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsedData, setParsedData] = useState(null); // { students, errors, warnings }
  const [fatalError, setFatalError] = useState("");

  // ───────────── Process file ─────────────
  const processFile = useCallback(async (file) => {
    setFileName(file.name);
    setUploadState(PARSING);
    setFatalError("");
    setParsedData(null);

    try {
      const { rows } = await readFile(file);
      const result = parseStudentData(rows);

      if (result.students.length === 0 && result.errors.length > 0) {
        setUploadState(ERROR_STATE);
        setFatalError("No valid student data could be parsed. Check the errors below.");
        setParsedData(result);
      } else {
        setUploadState(PREVIEW);
        setParsedData(result);
      }
    } catch (err) {
      setUploadState(ERROR_STATE);
      setFatalError(err.message);
    }
  }, []);

  // ───────────── Drag & drop handlers ─────────────
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  // ───────────── Confirm import ─────────────
  const handleConfirmImport = () => {
    if (parsedData?.students?.length > 0) {
      setStudents(parsedData.students);
      setUploadState(SUCCESS);
    }
  };

  // ───────────── Reset ─────────────
  const handleReset = () => {
    setUploadState(IDLE);
    setFileName("");
    setParsedData(null);
    setFatalError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGoToDashboard = () => {
    setCurrentPage("dashboard");
  };

  // ───────────── Render helpers ─────────────
  const card = (children, extraClass = "") => (
    <div className={`rounded-2xl p-6 transition-all duration-300 ${extraClass} ${
      darkMode ? "bg-surface-card-dark border border-border-dark" : "bg-surface-card-light border border-border-light shadow-sm"
    }`}>
      {children}
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* ────────── Format Instructions ────────── */}
      {card(
        <>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span>📋</span> Data Format Guide
          </h2>
          <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Upload a CSV or Excel file with <strong>one row per subject per student</strong>. Each student should have 4 rows (one per subject).
          </p>

          {/* Expected columns */}
          <div className={`rounded-xl p-4 mb-4 ${darkMode ? "bg-surface-hover-dark/60" : "bg-gray-50"}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              Required Columns
            </p>
            <div className="flex flex-wrap gap-2">
              {["Student Name", "Roll No", "Subject", "Week 1", "Week 2", "Week 3", "Week 4"].map((col) => (
                <span key={col} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  darkMode ? "bg-primary-600/20 text-primary-400" : "bg-primary-100 text-primary-600"
                }`}>
                  {col}
                </span>
              ))}
              <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                darkMode ? "bg-surface-hover-dark text-gray-500" : "bg-gray-200 text-gray-400"
              }`}>
                Overall <span className="opacity-60">(optional)</span>
              </span>
            </div>
          </div>

          {/* Subject values */}
          <div className={`rounded-xl p-4 mb-4 ${darkMode ? "bg-surface-hover-dark/60" : "bg-gray-50"}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              Accepted Subject Values
            </p>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <span key={s.key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: s.color + "20", color: s.color }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          {/* Example */}
          <div className={`rounded-xl p-4 overflow-x-auto ${darkMode ? "bg-surface-hover-dark/60" : "bg-gray-50"}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              Example Data
            </p>
            <table className="text-xs w-full min-w-[500px]">
              <thead>
                <tr className={darkMode ? "text-gray-500" : "text-gray-400"}>
                  <th className="text-left py-1 pr-4">Student Name</th>
                  <th className="text-left py-1 pr-4">Roll No</th>
                  <th className="text-left py-1 pr-4">Subject</th>
                  <th className="text-center py-1 px-2">Week 1</th>
                  <th className="text-center py-1 px-2">Week 2</th>
                  <th className="text-center py-1 px-2">Week 3</th>
                  <th className="text-center py-1 px-2">Week 4</th>
                </tr>
              </thead>
              <tbody className={darkMode ? "text-gray-300" : "text-gray-700"}>
                <tr><td className="py-1 pr-4">John Doe</td><td className="pr-4">101</td><td className="pr-4">Okta</td><td className="text-center px-2">80</td><td className="text-center px-2">85</td><td className="text-center px-2">78</td><td className="text-center px-2">90</td></tr>
                <tr><td className="py-1 pr-4">John Doe</td><td className="pr-4">101</td><td className="pr-4">SailPoint</td><td className="text-center px-2">75</td><td className="text-center px-2">70</td><td className="text-center px-2">72</td><td className="text-center px-2">74</td></tr>
                <tr className={darkMode ? "text-gray-600" : "text-gray-300"}>
                  <td colSpan={7} className="py-1 italic">...2 more rows for Cyber Security Foundations & Cloud</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sample downloads */}
          <div className="flex gap-3 mt-4">
            <button
              id="download-sample-csv"
              onClick={downloadSampleCSV}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] ${
                darkMode
                  ? "bg-surface-hover-dark text-gray-300 hover:bg-border-dark hover:text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
              }`}
            >
              📥 Sample CSV
            </button>
            <button
              id="download-sample-xlsx"
              onClick={generateSampleExcel}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] ${
                darkMode
                  ? "bg-surface-hover-dark text-gray-300 hover:bg-border-dark hover:text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
              }`}
            >
              📥 Sample Excel
            </button>
          </div>
        </>,
        "animate-fade-in-up"
      )}

      {/* ────────── Upload Zone ────────── */}
      {(uploadState === IDLE || uploadState === ERROR_STATE) && (
        <div
          className={`animate-fade-in-up rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer group ${
            dragOver
              ? darkMode
                ? "border-primary-400 bg-primary-600/10"
                : "border-primary-400 bg-primary-50"
              : darkMode
              ? "border-border-dark bg-surface-card-dark hover:border-primary-600/40 hover:bg-surface-hover-dark/50"
              : "border-border-light bg-surface-card-light hover:border-primary-300 hover:bg-gray-50 shadow-sm"
          }`}
          style={{ animationDelay: "100ms" }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            id="file-upload-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 ${
            dragOver
              ? "bg-primary-600/30"
              : darkMode ? "bg-surface-hover-dark" : "bg-gray-100"
          }`}>
            <svg className={`w-8 h-8 transition-colors ${dragOver ? "text-primary-400" : darkMode ? "text-gray-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <p className="text-lg font-semibold mb-1">
            {dragOver ? "Drop your file here" : "Drag & drop your file here"}
          </p>
          <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            or <span className="text-primary-400 font-medium">click to browse</span> — CSV, XLSX supported
          </p>
        </div>
      )}

      {/* ────────── Parsing indicator ────────── */}
      {uploadState === PARSING && (
        <div className={`animate-fade-in-up rounded-2xl p-8 text-center ${
          darkMode ? "bg-surface-card-dark border border-border-dark" : "bg-surface-card-light border border-border-light shadow-sm"
        }`}>
          <div className="animate-spin mx-auto w-10 h-10 border-3 border-primary-400 border-t-transparent rounded-full mb-4" />
          <p className="font-semibold">Parsing {fileName}…</p>
          <p className={`text-sm mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Validating rows and detecting format</p>
        </div>
      )}

      {/* ────────── Fatal error banner ────────── */}
      {uploadState === ERROR_STATE && fatalError && (
        <div className="animate-fade-in-up rounded-2xl p-5 border border-rose-500/30 bg-rose-500/10">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">❌</span>
            <div>
              <p className="font-bold text-rose-400">Upload Failed</p>
              <p className={`text-sm mt-1 ${darkMode ? "text-rose-300" : "text-rose-700"}`}>{fatalError}</p>
            </div>
          </div>
        </div>
      )}

      {/* ────────── Errors & warnings list ────────── */}
      {parsedData && (parsedData.errors.length > 0 || parsedData.warnings.length > 0) && (
        <div className="animate-fade-in-up space-y-4" style={{ animationDelay: "50ms" }}>
          {/* Errors */}
          {parsedData.errors.length > 0 && card(
            <>
              <h3 className="font-bold text-rose-400 flex items-center gap-2 mb-3">
                <span>🔴</span> Errors ({parsedData.errors.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {parsedData.errors.map((err, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl text-sm ${
                    darkMode ? "bg-rose-500/10 text-rose-300" : "bg-rose-50 text-rose-700"
                  }`}>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${
                      darkMode ? "bg-rose-500/20 text-rose-400" : "bg-rose-100 text-rose-600"
                    }`}>Row {err.row}</span>
                    <span>{err.message}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Warnings */}
          {parsedData.warnings.length > 0 && card(
            <>
              <h3 className="font-bold text-amber-400 flex items-center gap-2 mb-3">
                <span>⚠️</span> Warnings ({parsedData.warnings.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {parsedData.warnings.map((warn, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl text-sm ${
                    darkMode ? "bg-amber-500/10 text-amber-300" : "bg-amber-50 text-amber-700"
                  }`}>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${
                      darkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600"
                    }`}>Row {warn.row}</span>
                    <span>{warn.message}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ────────── Preview table ────────── */}
      {uploadState === PREVIEW && parsedData?.students?.length > 0 && (
        <>
          {/* Summary banner */}
          {card(
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${darkMode ? "bg-emerald-500/20" : "bg-emerald-50"}`}>
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <p className="font-bold text-lg">
                    {parsedData.students.length} student{parsedData.students.length !== 1 ? "s" : ""} parsed successfully
                  </p>
                  <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    From <strong>{fileName}</strong>
                    {parsedData.errors.length > 0 && (
                      <span className="text-rose-400 ml-2">• {parsedData.errors.length} error{parsedData.errors.length !== 1 ? "s" : ""} skipped</span>
                    )}
                    {parsedData.warnings.length > 0 && (
                      <span className="text-amber-400 ml-2">• {parsedData.warnings.length} warning{parsedData.warnings.length !== 1 ? "s" : ""}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  id="cancel-import"
                  onClick={handleReset}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    darkMode
                      ? "bg-surface-hover-dark text-gray-300 hover:bg-border-dark"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  id="confirm-import"
                  onClick={handleConfirmImport}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-all duration-200 hover:shadow-lg hover:shadow-primary-600/25"
                >
                  ✓ Confirm Import
                </button>
              </div>
            </div>,
            "animate-fade-in-up"
          )}

          {/* Preview table */}
          {card(
            <>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span>👀</span> Preview — Data to be imported
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className={darkMode ? "bg-surface-hover-dark/50" : "bg-gray-50"}>
                      <th className={`text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Name</th>
                      <th className={`text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Roll No</th>
                      {subjects.map((s) => (
                        <th key={s.key} className={`text-center px-3 py-3 font-semibold text-xs uppercase tracking-wider ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                          <span className="flex items-center justify-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                            {s.name === "Cyber Security Foundations" ? "Cyber Sec" : s.name}
                          </span>
                        </th>
                      ))}
                      <th className={`text-center px-4 py-3 font-semibold text-xs uppercase tracking-wider ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Overall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.students.map((student) => {
                      const overall = getOverallAverage(student);
                      return (
                        <tr
                          key={student.id}
                          className={`transition-colors ${darkMode ? "border-t border-border-dark hover:bg-surface-hover-dark/50" : "border-t border-border-light hover:bg-gray-50"}`}
                        >
                          <td className="px-4 py-3 font-medium">{student.name}</td>
                          <td className={`px-4 py-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{student.rollNo}</td>
                          {subjects.map((s) => {
                            const avg = getSubjectAverage(student, s.key);
                            return (
                              <td key={s.key} className="px-3 py-3 text-center">
                                <span className={`font-bold ${
                                  avg >= 80 ? "text-emerald-400" : avg >= 60 ? "text-amber-400" : "text-rose-400"
                                }`}>
                                  {avg.toFixed(1)}
                                </span>
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 text-center">
                            <span className={`font-extrabold ${overall >= 80 ? "text-emerald-400" : overall >= 60 ? "text-amber-400" : "text-rose-400"}`}>
                              {overall.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>,
            "animate-fade-in-up mt-0"
          )}
        </>
      )}

      {/* ────────── Success state ────────── */}
      {uploadState === SUCCESS && (
        <div className="animate-fade-in-up rounded-2xl p-8 text-center border border-emerald-500/30 bg-emerald-500/10">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-xl font-bold mb-2 text-emerald-400">Data Imported Successfully!</h3>
          <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {parsedData?.students?.length} students loaded. The dashboard now reflects your uploaded data.
          </p>
          <div className="flex justify-center gap-3">
            <button
              id="go-to-dashboard"
              onClick={handleGoToDashboard}
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-all duration-200 hover:shadow-lg hover:shadow-primary-600/25"
            >
              Go to Dashboard →
            </button>
            <button
              id="upload-another"
              onClick={handleReset}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                darkMode
                  ? "bg-surface-hover-dark text-gray-300 hover:bg-border-dark"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Upload Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
