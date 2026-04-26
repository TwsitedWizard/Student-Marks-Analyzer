import * as XLSX from "xlsx";
import { subjects, weeks, weekLabels } from "../data/students";
import { getSubjectAverage, getOverallAverage, getBestSubject, getWeakestSubject } from "./analytics";

// ─── Safe mark getter — handles missing/malformed data ───
function getMark(student, subjectKey, weekKey) {
  const val = student?.marks?.[subjectKey]?.[weekKey];
  const num = Number(val);
  return isNaN(num) ? 0 : num;
}

// ─── Format 1: Wide format (one row per student, all subjects expanded) ───
function buildStudentRowsWide(studentsList) {
  return studentsList.map((student) => {
    const row = {
      "Student Name": student.name || "",
      "Roll No": student.rollNo || "",
    };
    for (const subject of subjects) {
      for (let i = 0; i < weeks.length; i++) {
        row[`${subject.name} - ${weekLabels[i]}`] = getMark(student, subject.key, weeks[i]);
      }
      row[`${subject.name} - Average`] = +getSubjectAverage(student, subject.key).toFixed(2);
    }
    row["Overall Average"] = +getOverallAverage(student).toFixed(2);
    row["Best Subject"] = getBestSubject(student).name;
    row["Weakest Subject"] = getWeakestSubject(student).name;
    return row;
  });
}

// ─── Format 2: Long/flat format (one row per student per subject — re-importable) ───
function buildStudentRowsLong(studentsList) {
  const rows = [];
  studentsList.forEach((student) => {
    subjects.forEach((subject) => {
      const w1 = getMark(student, subject.key, "week1");
      const w2 = getMark(student, subject.key, "week2");
      const w3 = getMark(student, subject.key, "week3");
      const w4 = getMark(student, subject.key, "week4");
      const overall = +((w1 + w2 + w3 + w4) / 4).toFixed(2);

      rows.push({
        "Student Name": student.name || "",
        "Roll No": student.rollNo || "",
        "Subject": subject.name,
        "Week 1": w1,
        "Week 2": w2,
        "Week 3": w3,
        "Week 4": w4,
        "Overall": overall,
      });
    });
  });
  return rows;
}

// ─── Auto-size columns helper ───
function autoSizeColumns(rows) {
  if (!rows || rows.length === 0) return [];
  return Object.keys(rows[0]).map((key) => ({
    wch: Math.max(key.length + 2, 14),
  }));
}

// ═══════════════════════════════════════════════════════════════
// DOWNLOAD HELPERS
// ═══════════════════════════════════════════════════════════════

const downloadFile = (data, filename, type) => {
  const blob = new Blob([data], { type });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);

  // ✅ FIX: delay revoking
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};

// ═══════════════════════════════════════════════════════════════
// PUBLIC EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// ─── Full dataset CSV ───
export function exportToCSV(studentsList, filename = "Student_Performance_Report") {
  if (!studentsList || studentsList.length === 0) {
    alert("No data to export. Please upload or load student data first.");
    return;
  }

  const rows = buildStudentRowsLong(studentsList);
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  console.log("Downloading:", `${filename}.csv`);
  downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

// ─── Full dataset Excel (3 sheets) ───
export function exportToExcel(studentsList, filename = "Student_Performance_Report") {
  if (!studentsList || studentsList.length === 0) {
    alert("No data to export. Please upload or load student data first.");
    return;
  }

  const wb = XLSX.utils.book_new();

  // Sheet 1: Flat/long format (re-importable)
  const longRows = buildStudentRowsLong(studentsList);
  const wsLong = XLSX.utils.json_to_sheet(longRows);
  wsLong["!cols"] = autoSizeColumns(longRows);
  XLSX.utils.book_append_sheet(wb, wsLong, "Performance Data");

  // Sheet 2: Wide analytics summary
  const wideRows = buildStudentRowsWide(studentsList);
  const wsWide = XLSX.utils.json_to_sheet(wideRows);
  wsWide["!cols"] = autoSizeColumns(wideRows);
  XLSX.utils.book_append_sheet(wb, wsWide, "Analytics Summary");

  // Sheet 3: Class summary
  const classAvg = +(studentsList.reduce((sum, s) => sum + getOverallAverage(s), 0) / studentsList.length).toFixed(2);
  const sorted = [...studentsList].sort((a, b) => getOverallAverage(b) - getOverallAverage(a));
  const summaryRows = [
    { Metric: "Total Students", Value: studentsList.length },
    { Metric: "Class Average", Value: classAvg },
    { Metric: "Top Performer", Value: sorted[0]?.name || "N/A" },
    { Metric: "Top Performer Average", Value: sorted[0] ? +getOverallAverage(sorted[0]).toFixed(2) : 0 },
    { Metric: "Lowest Performer", Value: sorted[sorted.length - 1]?.name || "N/A" },
    { Metric: "Lowest Performer Average", Value: sorted[sorted.length - 1] ? +getOverallAverage(sorted[sorted.length - 1]).toFixed(2) : 0 },
    { Metric: "Subjects", Value: subjects.map((s) => s.name).join(", ") },
    { Metric: "Weeks Tracked", Value: weeks.length },
    { Metric: "Report Generated", Value: new Date().toLocaleString() },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary["!cols"] = [{ wch: 25 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Class Summary");

  console.log("Downloading:", `${filename}.xlsx`);
  // ✅ Use built-in safe method
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// ─── Individual student Excel ───
export function exportStudentReport(student) {
  if (!student) { alert("No student selected."); return; }

  const wb = XLSX.utils.book_new();

  const longRows = buildStudentRowsLong([student]);
  const wsLong = XLSX.utils.json_to_sheet(longRows);
  wsLong["!cols"] = autoSizeColumns(longRows);
  XLSX.utils.book_append_sheet(wb, wsLong, "Performance Data");

  const wideRows = buildStudentRowsWide([student]);
  const wsWide = XLSX.utils.json_to_sheet(wideRows);
  wsWide["!cols"] = autoSizeColumns(wideRows);
  XLSX.utils.book_append_sheet(wb, wsWide, "Summary");

  const safeName = student.name.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");
  console.log("Downloading:", `${safeName}_Report.xlsx`);
  // ✅ Use built-in safe method
  XLSX.writeFile(wb, `${safeName}_Report.xlsx`);
}

// ─── Individual student CSV ───
export function exportStudentCSV(student) {
  if (!student) { alert("No student selected."); return; }

  const rows = buildStudentRowsLong([student]);
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const safeName = student.name.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");
  console.log("Downloading:", `${safeName}_Report.csv`);
  downloadFile(csv, `${safeName}_Report.csv`, "text/csv;charset=utf-8;");
}
