import React from "react";
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
} from "recharts";
import { BarChart2, DollarSign, Users, Activity } from "lucide-react";

// Sample data
const salesData = [
	{ month: "Jan", sales: 4000 },
	{ month: "Feb", sales: 3000 },
	{ month: "Mar", sales: 5000 },
	{ month: "Apr", sales: 4000 },
	{ month: "May", sales: 6000 },
	{ month: "Jun", sales: 7000 },
];

const revenueData = [
	{ month: "Jan", revenue: 12000 },
	{ month: "Feb", revenue: 15000 },
	{ month: "Mar", revenue: 10000 },
	{ month: "Apr", revenue: 20000 },
	{ month: "May", revenue: 25000 },
	{ month: "Jun", revenue: 22000 },
];

const departmentPieData = [
	{ name: "Sales", value: 4000, color: "#4f46e5" },
	{ name: "Finance", value: 3000, color: "#10b981" },
	{ name: "Support", value: 2000, color: "#f59e0b" },
	{ name: "Recon", value: 1500, color: "#ef4444" },
];

const Dashboard = () => {
	return (
		<div className="p-6 bg-gray-100 min-h-screen">
			{/* Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-800">
						Welcome, Superadmin
					</h1>
					<p className="text-gray-500 mt-1">
						Manage your CRM and all department dashboards here.
					</p>
				</div>
			</div>

			{/* Metrics Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
				<div className="bg-white p-5 rounded-2xl shadow flex items-center space-x-4 hover:shadow-lg transition">
					<Users size={36} className="text-indigo-600" />
					<div>
						<p className="text-gray-500 text-sm">Total Users</p>
						<h2 className="text-xl font-bold text-gray-800">1,250</h2>
					</div>
				</div>
				<div className="bg-white p-5 rounded-2xl shadow flex items-center space-x-4 hover:shadow-lg transition">
					<DollarSign size={36} className="text-green-600" />
					<div>
						<p className="text-gray-500 text-sm">Revenue</p>
						<h2 className="text-xl font-bold text-gray-800">$45,230</h2>
					</div>
				</div>
				<div className="bg-white p-5 rounded-2xl shadow flex items-center space-x-4 hover:shadow-lg transition">
					<BarChart2 size={36} className="text-orange-600" />
					<div>
						<p className="text-gray-500 text-sm">Sales</p>
						<h2 className="text-xl font-bold text-gray-800">320</h2>
					</div>
				</div>
				<div className="bg-white p-5 rounded-2xl shadow flex items-center space-x-4 hover:shadow-lg transition">
					<Activity size={36} className="text-red-600" />
					<div>
						<p className="text-gray-500 text-sm">Active Sessions</p>
						<h2 className="text-xl font-bold text-gray-800">98</h2>
					</div>
				</div>
			</div>

			{/* Charts Section */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
				{/* Sales Line Chart */}
				<div className="col-span-2 bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
					<h3 className="font-semibold text-gray-800 mb-4">Monthly Sales</h3>
					<ResponsiveContainer width="100%" height={300}>
						<LineChart
							data={salesData}
							margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
						>
							<XAxis dataKey="month" stroke="#888888" />
							<YAxis stroke="#888888" />
							<Tooltip />
							<CartesianGrid stroke="#f5f5f5" />
							<Line
								type="monotone"
								dataKey="sales"
								stroke="#4f46e5"
								strokeWidth={3}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>

				{/* Department Pie Chart */}
				<div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
					<h3 className="font-semibold text-gray-800 mb-4">
						Department Distribution
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<PieChart>
							<Pie
								data={departmentPieData}
								dataKey="value"
								nameKey="name"
								outerRadius={100}
								fill="#8884d8"
								label
							>
								{departmentPieData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Pie>
							<Legend verticalAlign="bottom" height={36} />
						</PieChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Revenue Bar Chart */}
			<div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition mb-6">
				<h3 className="font-semibold text-gray-800 mb-4">Monthly Revenue</h3>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart
						data={revenueData}
						margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
					>
						<XAxis dataKey="month" stroke="#888888" />
						<YAxis stroke="#888888" />
						<Tooltip />
						<CartesianGrid stroke="#f5f5f5" />
						<Bar dataKey="revenue" fill="#10b981" barSize={30} />
					</BarChart>
				</ResponsiveContainer>
			</div>

			{/* Recent Activity */}
			<div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
				<h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
				<ul className="space-y-3">
					<li className="flex justify-between items-center">
						<div>
							<p className="text-gray-700">John Doe added a new user</p>
							<p className="text-gray-400 text-sm">2 hours ago</p>
						</div>
						<span className="text-green-500 text-sm">+1</span>
					</li>
					<li className="flex justify-between items-center">
						<div>
							<p className="text-gray-700">Payment received from ACME Corp</p>
							<p className="text-gray-400 text-sm">5 hours ago</p>
						</div>
						<span className="text-green-500 text-sm">+$1,200</span>
					</li>
					<li className="flex justify-between items-center">
						<div>
							<p className="text-gray-700">Sales report generated</p>
							<p className="text-gray-400 text-sm">1 day ago</p>
						</div>
						<span className="text-indigo-500 text-sm">Report</span>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default Dashboard;
