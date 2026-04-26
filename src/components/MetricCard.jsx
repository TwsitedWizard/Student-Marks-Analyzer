import useStore from "../store/useStore";

export default function MetricCard({ title, value, subtitle, icon, color, delay = 0, trend }) {
  const darkMode = useStore((s) => s.darkMode);

  const colorClasses = {
    indigo: "from-primary-500 to-primary-700",
    cyan: "from-cyan-400 to-cyan-600",
    amber: "from-amber-400 to-amber-600",
    emerald: "from-emerald-400 to-emerald-600",
    rose: "from-rose-400 to-rose-600",
  };

  return (
    <div
      className={`animate-fade-in-up relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${
        darkMode
          ? "bg-surface-card-dark border border-border-dark hover:border-primary-600/30"
          : "bg-surface-card-light border border-border-light hover:border-primary-300 shadow-sm"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color] || colorClasses.indigo} opacity-80`}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            {title}
          </p>
          <p className="text-3xl font-extrabold mt-2">{value}</p>
          {subtitle && (
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-gray-400"
            }`}>
              {trend === "up" && (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {trend === "down" && (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {trend === "up" ? "Trending up" : trend === "down" ? "Trending down" : "Stable"}
            </div>
          )}
        </div>

        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color] || colorClasses.indigo} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          <span className="text-white text-lg">{icon}</span>
        </div>
      </div>

      {/* Subtle background decoration */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br ${colorClasses[color] || colorClasses.indigo} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
    </div>
  );
}
