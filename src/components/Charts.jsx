import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell,
} from "recharts";
import { subjects } from "../data/students";
import useStore from "../store/useStore";

// Custom tooltip component
function CustomTooltip({ active, payload, label, darkMode }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-xl px-4 py-3 shadow-2xl border ${
      darkMode
        ? "bg-surface-card-dark/95 border-border-dark text-gray-200"
        : "bg-white/95 border-gray-200 text-gray-800"
    }`}>
      <p className="font-semibold text-sm mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs py-0.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className={darkMode ? "text-gray-400" : "text-gray-500"}>{entry.name}:</span>
          <span className="font-bold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// Generate a lightweight hash from data for use as React key
function dataFingerprint(data) {
  if (!data || data.length === 0) return "empty";
  // Use length + first/last values for a fast, unique-enough key
  const first = JSON.stringify(data[0]);
  const last = JSON.stringify(data[data.length - 1]);
  return `${data.length}-${first.length}-${last.length}`;
}

export function PerformanceLineChart({ data, height = 350 }) {
  const darkMode = useStore((s) => s.darkMode);
  const dataVersion = useStore((s) => s.dataVersion);

  return (
    <ResponsiveContainer key={`line-${dataVersion}-${dataFingerprint(data)}`} width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          {subjects.map((s) => (
            <linearGradient key={s.key} id={`line-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0.3} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={darkMode ? "#2a2e3d" : "#e2e8f0"}
          vertical={false}
        />
        <XAxis
          dataKey="week"
          stroke={darkMode ? "#6b7280" : "#9ca3af"}
          tick={{ fontSize: 12, fill: darkMode ? "#9ca3af" : "#6b7280" }}
        />
        <YAxis
          domain={[0, 100]}
          stroke={darkMode ? "#6b7280" : "#9ca3af"}
          tick={{ fontSize: 12, fill: darkMode ? "#9ca3af" : "#6b7280" }}
        />
        <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
        <Legend
          wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
        />
        {subjects.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={3}
            dot={{ r: 5, fill: s.color, strokeWidth: 2, stroke: darkMode ? "#1a1d27" : "#fff" }}
            activeDot={{ r: 7, strokeWidth: 3 }}
            animationDuration={1000}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PerformanceRadarChart({ data, height = 350 }) {
  const darkMode = useStore((s) => s.darkMode);
  const dataVersion = useStore((s) => s.dataVersion);

  return (
    <ResponsiveContainer key={`radar-${dataVersion}-${dataFingerprint(data)}`} width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke={darkMode ? "#2a2e3d" : "#e2e8f0"} />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: darkMode ? "#9ca3af" : "#6b7280" }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: darkMode ? "#6b7280" : "#9ca3af" }}
        />
        <Radar
          name="Performance"
          dataKey="value"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.25}
          strokeWidth={2}
          animationDuration={1000}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function PerformanceBarChart({ data, height = 350 }) {
  const darkMode = useStore((s) => s.darkMode);
  const dataVersion = useStore((s) => s.dataVersion);

  return (
    <ResponsiveContainer key={`bar-${dataVersion}-${dataFingerprint(data)}`} width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={darkMode ? "#2a2e3d" : "#e2e8f0"}
          vertical={false}
        />
        <XAxis
          dataKey="subject"
          stroke={darkMode ? "#6b7280" : "#9ca3af"}
          tick={{ fontSize: 11, fill: darkMode ? "#9ca3af" : "#6b7280" }}
        />
        <YAxis
          domain={[0, 100]}
          stroke={darkMode ? "#6b7280" : "#9ca3af"}
          tick={{ fontSize: 12, fill: darkMode ? "#9ca3af" : "#6b7280" }}
        />
        <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
        <Bar dataKey="average" name="Average" radius={[8, 8, 0, 0]} animationDuration={800}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
