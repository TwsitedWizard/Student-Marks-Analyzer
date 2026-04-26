import { subjects, weeks } from "../data/students";

// ─── Safe accessor — prevents crashes on missing/malformed data ───
function getMark(student, subjectKey, weekKey) {
  const val = student?.marks?.[subjectKey]?.[weekKey];
  const num = Number(val);
  return isNaN(num) ? 0 : num;
}

// Get all weekly marks for a student in a specific subject
export function getSubjectWeeklyMarks(student, subjectKey) {
  return weeks.map((week) => getMark(student, subjectKey, week));
}

// Calculate average for a specific subject across all weeks
export function getSubjectAverage(student, subjectKey) {
  const marks = getSubjectWeeklyMarks(student, subjectKey);
  return marks.reduce((sum, m) => sum + m, 0) / marks.length;
}

// Calculate overall average across all subjects and weeks
export function getOverallAverage(student) {
  const allMarks = subjects.flatMap((s) =>
    weeks.map((w) => getMark(student, s.key, w))
  );
  return allMarks.reduce((sum, m) => sum + m, 0) / allMarks.length;
}

// Get the best subject for a student
export function getBestSubject(student) {
  let best = subjects[0]; // fallback
  let bestAvg = -1;
  for (const subject of subjects) {
    const avg = getSubjectAverage(student, subject.key);
    if (avg > bestAvg) {
      bestAvg = avg;
      best = subject;
    }
  }
  return best;
}

// Get the weakest subject for a student
export function getWeakestSubject(student) {
  let worst = subjects[0]; // fallback
  let worstAvg = 101;
  for (const subject of subjects) {
    const avg = getSubjectAverage(student, subject.key);
    if (avg < worstAvg) {
      worstAvg = avg;
      worst = subject;
    }
  }
  return worst;
}

// Determine performance trend for a subject
export function getSubjectTrend(student, subjectKey) {
  const marks = getSubjectWeeklyMarks(student, subjectKey);
  let increasing = 0;
  let decreasing = 0;
  for (let i = 1; i < marks.length; i++) {
    if (marks[i] > marks[i - 1]) increasing++;
    else if (marks[i] < marks[i - 1]) decreasing++;
  }
  if (increasing >= 2 && decreasing === 0) return "Improving";
  if (decreasing >= 2 && increasing === 0) return "Declining";
  if (increasing > decreasing) return "Mostly Improving";
  if (decreasing > increasing) return "Mostly Declining";
  return "Stable";
}

// Get overall trend across all subjects
export function getOverallTrend(student) {
  const weekAverages = weeks.map((week) => {
    const marks = subjects.map((s) => getMark(student, s.key, week));
    return marks.reduce((sum, m) => sum + m, 0) / marks.length;
  });
  let increasing = 0;
  let decreasing = 0;
  for (let i = 1; i < weekAverages.length; i++) {
    if (weekAverages[i] > weekAverages[i - 1]) increasing++;
    else if (weekAverages[i] < weekAverages[i - 1]) decreasing++;
  }
  if (increasing >= 2 && decreasing === 0) return "Improving";
  if (decreasing >= 2 && increasing === 0) return "Declining";
  if (increasing > decreasing) return "Mostly Improving";
  if (decreasing > increasing) return "Mostly Declining";
  return "Stable";
}

// Generate smart insights for a student
export function generateInsights(student) {
  const insights = [];
  const overallAvg = getOverallAverage(student);
  const best = getBestSubject(student);
  const weakest = getWeakestSubject(student);
  const trend = getOverallTrend(student);

  // Overall performance comment
  if (overallAvg > 80) {
    insights.push({
      type: "success",
      text: `Excellent performance with an overall average of ${overallAvg.toFixed(1)}%. Keep up the outstanding work!`,
    });
  } else if (overallAvg >= 60) {
    insights.push({
      type: "warning",
      text: `Good performance with ${overallAvg.toFixed(1)}% average, but there's room for improvement. Focus on weaker areas.`,
    });
  } else {
    insights.push({
      type: "danger",
      text: `Needs improvement — overall average is ${overallAvg.toFixed(1)}%. Immediate attention and support recommended.`,
    });
  }

  // Trend insight
  if (trend === "Improving" || trend === "Mostly Improving") {
    insights.push({
      type: "success",
      text: `Performance is trending upward — showing consistent improvement across weeks.`,
    });
  } else if (trend === "Declining" || trend === "Mostly Declining") {
    insights.push({
      type: "danger",
      text: `Performance is declining over the weeks. Consider identifying and addressing challenges early.`,
    });
  }

  // Subject-specific insights
  const weakestAvg = getSubjectAverage(student, weakest.key);
  const bestAvg = getSubjectAverage(student, best.key);
  if (bestAvg - weakestAvg > 15) {
    insights.push({
      type: "warning",
      text: `Significant gap between ${best.name} (${bestAvg.toFixed(1)}%) and ${weakest.name} (${weakestAvg.toFixed(1)}%). Consider dedicating more time to ${weakest.name}.`,
    });
  }

  // Declining subject detection
  for (const subject of subjects) {
    const subjectTrend = getSubjectTrend(student, subject.key);
    if (subjectTrend === "Declining") {
      insights.push({
        type: "danger",
        text: `${subject.name} scores are declining consistently. Review study approach for this subject.`,
      });
    }
  }

  // Actionable suggestions
  const suggestions = [];
  if (weakestAvg < 60) {
    suggestions.push(`Prioritize ${weakest.name} — consider extra practice sessions or tutorials.`);
  }
  if (trend === "Declining" || trend === "Mostly Declining") {
    suggestions.push("Schedule regular study sessions and track weekly goals to reverse the decline.");
  }
  if (overallAvg < 70) {
    suggestions.push("Form study groups with high-performing peers for collaborative learning.");
  }
  if (bestAvg > 85) {
    suggestions.push(`Leverage strength in ${best.name} to mentor others and reinforce understanding.`);
  }
  if (suggestions.length === 0) {
    suggestions.push("Maintain current study habits and aim for consistency.");
    suggestions.push("Challenge yourself with advanced topics to push performance higher.");
  }

  return { insights, suggestions };
}

// Get class-level analytics
export function getClassAnalytics(studentsList) {
  if (!studentsList || studentsList.length === 0) {
    return {
      subjectAverages: subjects.map((s) => ({ ...s, average: 0 })),
      classAverage: 0,
      topStudent: { student: { name: "N/A", rollNo: "" }, average: 0 },
      lowestStudent: { student: { name: "N/A", rollNo: "" }, average: 0 },
      weeklySubjectData: [],
      studentAverages: [],
    };
  }

  // Average score per subject
  const subjectAverages = subjects.map((subject) => {
    const allMarks = studentsList.flatMap((s) =>
      weeks.map((w) => getMark(s, subject.key, w))
    );
    const avg = allMarks.reduce((sum, m) => sum + m, 0) / allMarks.length;
    return { ...subject, average: avg };
  });

  // Overall class average
  const classAverage =
    subjectAverages.reduce((sum, s) => sum + s.average, 0) / subjectAverages.length;

  // Top performing student
  const studentAverages = studentsList.map((s) => ({
    student: s,
    average: getOverallAverage(s),
  }));
  studentAverages.sort((a, b) => b.average - a.average);

  const topStudent = studentAverages[0];
  const lowestStudent = studentAverages[studentAverages.length - 1];

  // Weekly class averages per subject (for the multi-line chart)
  const weeklySubjectData = weeks.map((week, i) => {
    const dataPoint = { week: `Week ${i + 1}` };
    for (const subject of subjects) {
      const marks = studentsList.map((s) => getMark(s, subject.key, week));
      dataPoint[subject.key] = +(
        marks.reduce((sum, m) => sum + m, 0) / marks.length
      ).toFixed(1);
    }
    return dataPoint;
  });

  return {
    subjectAverages,
    classAverage,
    topStudent,
    lowestStudent,
    weeklySubjectData,
    studentAverages,
  };
}

// Get student chart data for multi-line chart
export function getStudentChartData(student) {
  return weeks.map((week, i) => {
    const dataPoint = { week: `Week ${i + 1}` };
    for (const subject of subjects) {
      dataPoint[subject.key] = getMark(student, subject.key, week);
    }
    return dataPoint;
  });
}

// Get radar chart data for a student
export function getRadarData(student) {
  return subjects.map((subject) => ({
    subject: subject.name,
    value: +getSubjectAverage(student, subject.key).toFixed(1),
    fullMark: 100,
  }));
}

// Get bar chart data for a student
export function getBarData(student) {
  return subjects.map((subject) => ({
    subject: subject.name,
    average: +getSubjectAverage(student, subject.key).toFixed(1),
    color: subject.color,
  }));
}

// Generate heatmap data
export function getHeatmapData(studentsList) {
  if (!studentsList || studentsList.length === 0) return [];
  return studentsList.map((student) => ({
    name: student.name,
    weeks: weeks.map((week) => {
      const marks = subjects.map((s) => getMark(student, s.key, week));
      return +(marks.reduce((sum, m) => sum + m, 0) / marks.length).toFixed(1);
    }),
  }));
}
