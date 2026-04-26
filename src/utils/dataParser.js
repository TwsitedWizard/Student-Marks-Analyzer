import Papa from "papaparse";
import * as XLSX from "xlsx";
import { subjects } from "../data/students";

// Canonical subject name mapping — handles fuzzy user input
const SUBJECT_ALIASES = {
  okta: "okta",
  sailpoint: "sailpoint",
  "sail point": "sailpoint",
  "cyber security foundations": "cyberSecurity",
  "cyber security": "cyberSecurity",
  "cybersecurity foundations": "cyberSecurity",
  cybersecurity: "cyberSecurity",
  "cs foundations": "cyberSecurity",
  cloud: "cloud",
  "cloud computing": "cloud",
};

function normalizeSubjectKey(raw) {
  if (!raw) return null;
  const cleaned = raw.toString().trim().toLowerCase();
  return SUBJECT_ALIASES[cleaned] || null;
}

// ───────────────── Column header detection ─────────────────
// Users might name columns differently, so we fuzzy-match them
function detectColumns(headers) {
  const lower = headers.map((h) => h.toString().trim().toLowerCase());
  const map = { name: -1, rollNo: -1, subject: -1, week1: -1, week2: -1, week3: -1, week4: -1, overall: -1 };

  lower.forEach((h, i) => {
    if (/^(student\s*name|name|student)$/.test(h)) map.name = i;
    else if (/^(roll\s*no\.?|roll\s*number|rollno|roll)$/.test(h)) map.rollNo = i;
    else if (/^(subject|course|subject\s*name)$/.test(h)) map.subject = i;
    else if (/^(week\s*1|w1|wk1|week1)$/.test(h)) map.week1 = i;
    else if (/^(week\s*2|w2|wk2|week2)$/.test(h)) map.week2 = i;
    else if (/^(week\s*3|w3|wk3|week3)$/.test(h)) map.week3 = i;
    else if (/^(week\s*4|w4|wk4|week4)$/.test(h)) map.week4 = i;
    else if (/^(overall|average|avg|total)$/.test(h)) map.overall = i;
  });

  return map;
}

// ───────────────── File reading ─────────────────
export function readFile(file) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "csv") {
      Papa.parse(file, {
        skipEmptyLines: true,
        complete: (results) => resolve({ rows: results.data, ext }),
        error: (err) => reject(new Error(`CSV parse error: ${err.message}`)),
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: "array" });
          const sheetName = wb.SheetNames[0];
          const ws = wb.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
          resolve({ rows, ext });
        } catch (err) {
          reject(new Error(`Excel parse error: ${err.message}`));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error(`Unsupported file format: .${ext}. Please upload CSV or XLSX.`));
    }
  });
}

// ───────────────── Main parser ─────────────────
export function parseStudentData(rawRows) {
  const errors = [];
  const warnings = [];

  if (!rawRows || rawRows.length < 2) {
    errors.push({ row: 0, message: "File is empty or has no data rows." });
    return { students: [], errors, warnings };
  }

  // Detect columns from header row
  const headers = rawRows[0];
  const colMap = detectColumns(headers);

  // Validate required columns exist
  const missing = [];
  if (colMap.name === -1) missing.push("Student Name");
  if (colMap.rollNo === -1) missing.push("Roll No");
  if (colMap.subject === -1) missing.push("Subject");
  if (colMap.week1 === -1) missing.push("Week 1");
  if (colMap.week2 === -1) missing.push("Week 2");
  if (colMap.week3 === -1) missing.push("Week 3");
  if (colMap.week4 === -1) missing.push("Week 4");

  if (missing.length > 0) {
    errors.push({
      row: 1,
      message: `Missing required columns: ${missing.join(", ")}. Found headers: [${headers.join(", ")}]`,
    });
    return { students: [], errors, warnings };
  }

  // Parse data rows → group by student
  const studentMap = new Map(); // key: rollNo → accumulated data
  const dataRows = rawRows.slice(1);

  dataRows.forEach((row, rowIdx) => {
    const lineNum = rowIdx + 2; // 1-indexed, +1 for header

    // Skip truly empty rows
    if (!row || row.every((cell) => cell === "" || cell === null || cell === undefined)) return;

    const name = (row[colMap.name] ?? "").toString().trim();
    const rollNo = (row[colMap.rollNo] ?? "").toString().trim();
    const subjectRaw = (row[colMap.subject] ?? "").toString().trim();
    const w1 = parseFloat(row[colMap.week1]);
    const w2 = parseFloat(row[colMap.week2]);
    const w3 = parseFloat(row[colMap.week3]);
    const w4 = parseFloat(row[colMap.week4]);

    // ── Validation ──
    if (!name) {
      errors.push({ row: lineNum, message: "Missing Student Name." });
      return;
    }
    if (!rollNo) {
      errors.push({ row: lineNum, message: `Missing Roll No for "${name}".` });
      return;
    }
    const subjectKey = normalizeSubjectKey(subjectRaw);
    if (!subjectKey) {
      errors.push({
        row: lineNum,
        message: `Unknown subject "${subjectRaw}" for ${name}. Expected: Okta, SailPoint, Cyber Security Foundations, Cloud.`,
      });
      return;
    }

    const weekMarks = [w1, w2, w3, w4];
    const markErrors = [];
    weekMarks.forEach((m, i) => {
      if (isNaN(m)) markErrors.push(`Week ${i + 1} is not a number`);
      else if (m < 0) markErrors.push(`Week ${i + 1} is negative (${m})`);
      else if (m > 100) markErrors.push(`Week ${i + 1} exceeds 100 (${m})`);
    });
    if (markErrors.length > 0) {
      errors.push({ row: lineNum, message: `Invalid marks for ${name} / ${subjectRaw}: ${markErrors.join("; ")}.` });
      return;
    }

    // ── Accumulate into student record ──
    const key = rollNo;
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        name,
        rollNo,
        marks: {},
        _rows: [],
      });
    }

    const student = studentMap.get(key);

    // Warn if same roll number has different names
    if (student.name !== name) {
      warnings.push({
        row: lineNum,
        message: `Roll No "${rollNo}" has inconsistent names: "${student.name}" vs "${name}". Using first occurrence.`,
      });
    }

    // Check duplicate subject entry
    if (student.marks[subjectKey]) {
      warnings.push({
        row: lineNum,
        message: `Duplicate subject "${subjectRaw}" for ${student.name} (${rollNo}). Overwriting with latest data.`,
      });
    }

    student.marks[subjectKey] = { week1: w1, week2: w2, week3: w3, week4: w4 };
    student._rows.push(lineNum);
  });

  // ── Convert map to array & validate completeness ──
  const REQUIRED_SUBJECTS = subjects.map((s) => s.key);
  const parsed = [];
  let idCounter = 1;

  studentMap.forEach((student) => {
    const missingSubs = REQUIRED_SUBJECTS.filter((k) => !student.marks[k]);
    if (missingSubs.length > 0) {
      const subjectNames = missingSubs.map(
        (k) => subjects.find((s) => s.key === k)?.name || k
      );
      warnings.push({
        row: student._rows[0],
        message: `${student.name} (${student.rollNo}) is missing data for: ${subjectNames.join(", ")}. Filling with 0.`,
      });
      // Fill missing subjects with zeros
      missingSubs.forEach((k) => {
        student.marks[k] = { week1: 0, week2: 0, week3: 0, week4: 0 };
      });
    }

    parsed.push({
      id: idCounter++,
      name: student.name,
      rollNo: student.rollNo,
      marks: student.marks,
    });
  });

  return { students: parsed, errors, warnings };
}

// ───────────────── Sample data generation ─────────────────
export function generateSampleCSV() {
  const headers = ["Student Name", "Roll No", "Subject", "Week 1", "Week 2", "Week 3", "Week 4"];
  const sampleStudents = [
    { name: "John Doe", rollNo: "101" },
    { name: "Jane Smith", rollNo: "102" },
    { name: "Alex Johnson", rollNo: "103" },
  ];
  const subjectNames = ["Okta", "SailPoint", "Cyber Security Foundations", "Cloud"];

  const rows = [headers.join(",")];
  sampleStudents.forEach((s) => {
    subjectNames.forEach((sub) => {
      const marks = Array.from({ length: 4 }, () => Math.floor(Math.random() * 41) + 60); // 60-100
      rows.push(`${s.name},${s.rollNo},${sub},${marks.join(",")}`);
    });
  });

  return rows.join("\n");
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

export function downloadSampleCSV() {
  const csv = generateSampleCSV();
  console.log("Downloading: sample_student_data.csv");
  downloadFile(csv, "sample_student_data.csv", "text/csv;charset=utf-8;");
}

export function generateSampleExcel() {
  const headers = ["Student Name", "Roll No", "Subject", "Week 1", "Week 2", "Week 3", "Week 4"];
  const sampleStudents = [
    { name: "John Doe", rollNo: "101" },
    { name: "Jane Smith", rollNo: "102" },
    { name: "Alex Johnson", rollNo: "103" },
  ];
  const subjectNames = ["Okta", "SailPoint", "Cyber Security Foundations", "Cloud"];
  const rows = [];

  sampleStudents.forEach((s) => {
    subjectNames.forEach((sub) => {
      const marks = Array.from({ length: 4 }, () => Math.floor(Math.random() * 41) + 60);
      rows.push({ "Student Name": s.name, "Roll No": s.rollNo, Subject: sub, "Week 1": marks[0], "Week 2": marks[1], "Week 3": marks[2], "Week 4": marks[3] });
    });
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Student Data");
  ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 2, 12) }));

  console.log("Downloading: sample_student_data.xlsx");
  // ✅ Use built-in safe method
  XLSX.writeFile(wb, "sample_student_data.xlsx");
}
