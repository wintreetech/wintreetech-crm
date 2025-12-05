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

const completionData = [
  { day: "Day 1", completed: 10 },
  { day: "Day 5", completed: 30 },
  { day: "Day 10", completed: 22 },
  { day: "Day 15", completed: 45 },
  { day: "Day 20", completed: 35 },
  { day: "Day 25", completed: 60 },
  { day: "Day 30", completed: 55 },
];

const statusData = [
  { name: "Completed", value: 72 },
  { name: "In Progress", value: 21 },
  { name: "Pending", value: 7 },
];

const STATUS_COLORS = ["#22c55e", "#3b82f6", "#9ca3af"];
const PRIMARY = "#13ecc8";

const Analytics = () => {
  const totalTasks = statusData.reduce((a, b) => a + b.value, 0);

  return (
    <div className="font-display bg-gray-50 dark:bg-background-dark min-h-screen">
      <div className="relative flex min-h-screen w-full">
        <main className="flex-1 p-6 sm:p-8 md:p-10">
          <div className="max-w-7xl mx-auto">
            {/* Title */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex flex-col gap-1">
                <h1 className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white">
                  Analytics Overview
                </h1>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: "Tasks Completed", value: "1,204" },
                { label: "Tasks In Progress", value: "350" },
                { label: "Tasks Pending", value: "122" },
                { label: "Workspaces Created", value: "8" },
              ].map((card) => (
                <div
                  key={card.label}
                  className="flex flex-col justify-between gap-4 rounded-xl p-5 bg-white dark:bg-background-dark border border-gray-200/50 dark:border-gray-800/50 shadow-sm"
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
              <div className="lg:col-span-3 flex flex-col gap-4 rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-background-dark p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[#0d1b19] dark:text-white text-lg font-semibold">
                      Completion Trend
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Task completion over the last 30 days.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: PRIMARY }}
                    />
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      Completed Tasks
                    </p>
                  </div>
                </div>

                <div className="h-[250px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={completionData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke={PRIMARY}
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status overview donut */}
              <div className="lg:col-span-2 flex flex-col gap-4 rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-background-dark p-6 shadow-sm">
                <div>
                  <p className="text-[#0d1b19] dark:text-white text-lg font-semibold">
                    Task Status Overview
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Distribution of tasks by status.
                  </p>
                </div>

                <div className="w-full flex justify-center items-center flex-1 my-4">
                  <div className="relative w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={2}
                        >
                          {statusData.map((_, i) => (
                            <Cell key={i} fill={STATUS_COLORS[i]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-2xl font-bold text-[#0d1b19] dark:text-white">
                        {totalTasks}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Tasks
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  {statusData.map((s, i) => (
                    <div key={s.name}>
                      <p className="flex items-center justify-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: STATUS_COLORS[i] }}
                        />
                        {s.name}
                      </p>
                      <p className="font-bold text-lg text-[#0d1b19] dark:text-white">
                        {s.value}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Performance table */}
            <div className="rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-background-dark overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50">
                <h3 className="text-lg font-semibold text-[#0d1b19] dark:text-white">
                  Team Performance
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/60 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Team Member</th>
                      <th className="px-6 py-4 text-center font-semibold">
                        Completed
                      </th>
                      <th className="px-6 py-4 text-center font-semibold">
                        In Progress
                      </th>
                      <th className="px-6 py-4 text-center font-semibold">
                        Pending
                      </th>
                      <th className="px-6 py-4 text-center font-semibold">
                        Completion Rate
                      </th>
                    </tr>
                  </thead>

                  <tbody>{/* your rows */}</tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
