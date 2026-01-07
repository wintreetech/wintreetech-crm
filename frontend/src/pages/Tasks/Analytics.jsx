import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { selectWorkspaces } from "../../store/slices/Workspaces.slice";

// ✅ Order: Completed (Green), In Progress (Blue), To Do (Amber)
const STATUS_COLORS = ["#22c55e", "#3b82f6", "#f59e0b"];
const PRIMARY = "#13ecc8";

const Analytics = () => {
  const workspaces = useSelector(selectWorkspaces) || [];

  // ✅ Extract and Calculate Real Data
  const stats = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let todo = 0;
    const trendMap = {};

    workspaces.forEach((ws) => {
      ws.columns?.forEach((col) => {
        col.tasks?.forEach((task) => {
          const status = task.status?.toLowerCase().replace(/\s/g, "");

          if (status === "completed" || status === "done") {
            completed++;
            if (task.updatedAt) {
              const date = new Date(task.updatedAt).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                }
              );
              trendMap[date] = (trendMap[date] || 0) + 1;
            }
          } else if (status === "inprogress") {
            inProgress++;
          } else {
            todo++;
          }
        });
      });
    });

    const trendData = Object.keys(trendMap)
      .map((date) => ({ day: date, completed: trendMap[date] }))
      .sort((a, b) => new Date(a.day) - new Date(b.day))
      .slice(-7);

    const total = completed + inProgress + todo || 1;

    return {
      completed,
      inProgress,
      todo,
      total,
      trendData:
        trendData.length > 0 ? trendData : [{ day: "No Data", completed: 0 }],
      pieData: [
        { name: "Completed", value: Math.round((completed / total) * 100) },
        { name: "In Progress", value: Math.round((inProgress / total) * 100) },
        { name: "To Do", value: Math.round((todo / total) * 100) },
      ],
    };
  }, [workspaces]);

  return (
    <div className="font-display bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <div className="relative flex min-h-screen w-full">
        <main className="flex-1 p-6 sm:p-8 md:p-10">
          <div className="max-w-7xl mx-auto">
            {/* Title */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <h1 className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white">
                Analytics Overview
              </h1>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[
                { label: "Tasks Completed", value: stats.completed },
                { label: "Tasks To Do", value: stats.todo },
                { label: "Workspaces Created", value: workspaces.length },
              ].map((card) => (
                <div
                  key={card.label}
                  className="flex flex-col justify-between gap-4 rounded-xl p-5 bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50 shadow-sm"
                >
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    {card.label}
                  </p>
                  <p className="text-[#0d1b19] dark:text-white tracking-tight text-3xl font-bold">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
              {/* Completion trend */}
              <div className="lg:col-span-3 min-w-0 flex flex-col gap-4 rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-gray-900 p-6 shadow-sm">
                <div>
                  <p className="text-[#0d1b19] dark:text-white text-lg font-semibold">
                    Completion Trend
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Recent task completion velocity.
                  </p>
                </div>

                <div className="h-[250px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.trendData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#374151"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#111827",
                          borderRadius: "8px",
                          border: "1px solid #374151",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                          color: "#fff",
                        }}
                        itemStyle={{ color: PRIMARY }}
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke={PRIMARY}
                        strokeWidth={3}
                        dot={{ r: 4, fill: PRIMARY, strokeWidth: 0 }}
                        activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status overview donut */}
              <div className="lg:col-span-2 min-w-0 flex flex-col gap-4 rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-gray-900 p-6 shadow-sm">
                <div>
                  <p className="text-[#0d1b19] dark:text-white text-lg font-semibold">
                    Task Status Overview
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Percentage distribution.
                  </p>
                </div>

                <div className="w-full flex justify-center items-center flex-1 my-4">
                  <div className="relative w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.pieData}
                          dataKey="value"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          stroke="none"
                        >
                          {stats.pieData.map((_, i) => (
                            <Cell key={i} fill={STATUS_COLORS[i]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-3xl font-bold text-[#0d1b19] dark:text-white">
                        {stats.total}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        Total
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  {stats.pieData.map((s, i) => (
                    <div key={s.name}>
                      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: STATUS_COLORS[i] }}
                        />
                        {s.name}
                      </p>
                      <p className="font-bold text-base text-[#0d1b19] dark:text-white">
                        {s.value}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
