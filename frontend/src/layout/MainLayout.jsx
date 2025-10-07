import { useState } from "react";
import { toast } from "react-hot-toast";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
	BarChart,
	Calculator,
	DollarSign,
	Headphones,
	LayoutDashboard,
	Menu,
	Users,
	X,
} from "lucide-react";

function MainLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [avatarOpen, setAvatarOpen] = useState(false);

	const storedUser = localStorage.getItem("currentUser");
	const currentUser = storedUser ? JSON.parse(storedUser) : null;

	const showSidebar =
		currentUser.role === "superadmin" || currentUser.role === "admin";

	const toggleSection = (value) => {
		navigate(`/${value}`);
		setSidebarOpen(false);
	};

	const handleLogoutClick = () => {
		localStorage.removeItem("currentUser");
		localStorage.clear();
		navigate("/login");
		toast.success("Logout Successfully");
	};
	const formatTitle = (path, user) => {
		// root
		if (path === "/") return "Home Dashboard";

		// Remove leading slash
		const name = path.replace("/", "").toLowerCase();

		// Special case for superadmin dashboard
		if (name === "dashboard" && user?.role === "superadmin") {
			return "Management Dashboard";
		}

		// Default: capitalize first letter + " Dashboard"
		return name.charAt(0).toUpperCase() + name.slice(1) + " Dashboard";
	};

	const pageTitle = formatTitle(location.pathname, currentUser);

	const sidebarItems = [
		{
			name: "Dashboard",
			icon: <LayoutDashboard size={18} />,
			path: "dashboard",
			roles: ["superadmin"], // only superadmin sees it
			department: "management",
		},
		{
			name: "Users",
			icon: <Users size={18} />,
			path: "users",
			roles: ["superadmin", "admin"], // visible to all admins/superadmins
		},
		{
			name: "Sales",
			icon: <BarChart size={18} />,
			path: "sales",
			roles: ["superadmin", "admin", "user"],
			department: "sales",
		},
		{
			name: "Support",
			icon: <Headphones size={18} />,
			path: "support",
			roles: ["superadmin", "admin", "user"],
			department: "support",
		},
		{
			name: "Recon",
			icon: <Calculator size={18} />,
			path: "recon",
			roles: ["superadmin", "admin", "user"],
			department: "recon",
		},
		{
			name: "Finance",
			icon: <DollarSign size={18} />,
			path: "finance",
			roles: ["superadmin", "admin", "user"],
			department: "finance",
		},
	];

	// Filter items the current user can see
	const allowedSidebarItems = sidebarItems.filter((item) => {
		if (!currentUser) return false;

		// Must have valid role
		if (!item.roles.includes(currentUser.role)) return false;

		// Superadmin should see all departments
		if (currentUser.role === "superadmin") return true;

		// Normal users restricted to their department
		if (item.department && currentUser.department !== item.department)
			return false;

		return true;
	});

	return (
		<div className="h-screen flex flex-col">
			{/* TOP HEADER */}
			<header className="flex justify-between items-center bg-gray-900 text-white px-4 py-2 shadow-md">
				{/* Left: Page Info */}
				<div>
					<h1 className="text-xl font-semibold leading-tight">{pageTitle}</h1>
					<p className="text-gray-400 text-xs">
						Welcome back,{" "}
						{currentUser.username.charAt(0).toUpperCase() +
							currentUser.username.slice(1)}{" "}
						(
						{currentUser.role.charAt(0).toUpperCase() +
							currentUser.role.slice(1)}
						) (
						{currentUser.department.charAt(0).toUpperCase() +
							currentUser.department.slice(1)}
						)
					</p>
				</div>

				{/* Right: Avatar Dropdown */}
				<div className="relative">
					<button
						onClick={() => setAvatarOpen(!avatarOpen)}
						className="bg-white text-black w-10 h-10 rounded-full  flex items-center justify-center text-[18px] font-semibold shadow-lg hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
					>
						{currentUser?.username.charAt(0).toUpperCase()}
					</button>

					{avatarOpen && (
						<ul className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl p-2 z-50 text-sm border border-gray-200">
							<li>
								<button
									onClick={handleLogoutClick}
									className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50 font-medium transition"
								>
									Logout
								</button>
							</li>
						</ul>
					)}
				</div>
			</header>

			{/* LAYOUT */}
			<div className="flex flex-1 overflow-hidden">
				{/* SIDEBAR (Superadmin + Admin only) */}
				{showSidebar && (
					<aside
						className={`${
							sidebarOpen ? "translate-x-0" : "-translate-x-full"
						} fixed md:static top-0 left-0 h-full w-64 bg-gray-900 text-white p-4 transition-transform duration-300 md:translate-x-0 z-40`}
					>
						{/* Close button for mobile */}
						<div className="flex justify-between items-center mb-6 md:hidden">
							<h2 className="text-xl font-bold">Menu</h2>
							<button onClick={() => setSidebarOpen(false)}>
								<X size={20} />
							</button>
						</div>

						<ul className="space-y-2">
							{allowedSidebarItems.map((item) => (
								<li key={item.path}>
									<button
										onClick={() => toggleSection(item.path)}
										className="cursor-pointer flex items-center w-full px-3 py-2 rounded-lg hover:bg-gray-800 transition"
									>
										{item.icon}
										<span className="ml-2">{item.name}</span>
									</button>
								</li>
							))}
						</ul>
					</aside>
				)}

				{/* MAIN CONTENT */}
				<main className="flex-1 bg-black p-2 overflow-y-auto">
					<Outlet />
				</main>
			</div>
		</div>
	);
}

export default MainLayout;
