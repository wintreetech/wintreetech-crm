import { createBrowserRouter, Navigate } from "react-router";
import App from "../App";
import {
	SalesDashboard,
	ReconDashboard,
	SupportDashboard,
	FinanceDashboard,
	Users,
	Dashboard,
} from "../pages";
import Login from "../component/Login";
import ProtectedRoutes from "../component/ProtectedRoutes";
import NotFound from "../component/NotFound";
import Unauthorized from "../component/Unauthorized";
import ComingSoon from "../component/ComingSoon";
import TaskLayout from "../layout/TaskLayout";
import MyTasks from "../pages/Tasks/MyTasks";
import Workspaces from "../pages/Tasks/Workspaces";
import TeamMembers from "../pages/Tasks/TeamMembers";
import Notifications from "../pages/Notifications";
import WorkspaceDetails from "../component/Tasks/Workspaces/WorkspaceDetails";
import Analytics from "../pages/Tasks/Analytics";
import ErrorBoundary from "../component/ErrorBoundary";
import ForgotPassword from "../component/ForgotPassword";
import NewPassword from "../component/NewPassword";

const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<ProtectedRoutes allowedRoles={["user", "admin", "superadmin"]}>
				<App />
			</ProtectedRoutes>
		),
		errorElement: <ErrorBoundary />,
		children: [
			{
				index: true,
				element: <Navigate to="/dashboard" replace />,
			},

			// ✅ DASHBOARD
			{
				path: "dashboard",
				element: (
					<ProtectedRoutes
						allowedRoles={["superadmin"]}
						allowedDepartments={["management"]}
					>
						<Dashboard />
					</ProtectedRoutes>
				),
			},

			// ✅ SALES
			{
				path: "sales",
				element: (
					<ProtectedRoutes
						allowedRoles={["user", "admin", "superadmin"]}
						allowedDepartments={["sales"]}
					>
						<SalesDashboard />
					</ProtectedRoutes>
				),
			},

			// ✅ RECON
			{
				path: "recon",
				element: (
					<ProtectedRoutes
						allowedRoles={["user", "admin", "superadmin"]}
						allowedDepartments={["recon"]}
					>
						<ComingSoon title="recon" />
					</ProtectedRoutes>
				),
			},

			// ✅ SUPPORT
			{
				path: "support",
				element: (
					<ProtectedRoutes
						allowedRoles={["user", "admin", "superadmin"]}
						allowedDepartments={["support"]}
					>
						<ComingSoon title="support" />
					</ProtectedRoutes>
				),
			},

			// ✅ FINANCE
			{
				path: "finance",
				element: (
					<ProtectedRoutes
						allowedRoles={["user", "admin", "superadmin"]}
						allowedDepartments={["finance"]}
					>
						<ComingSoon title="finance" />
					</ProtectedRoutes>
				),
			},

			// ✅ DEVELOPMENT
			{
				path: "development",
				element: (
					<ProtectedRoutes
						allowedRoles={["user", "admin", "superadmin"]}
						allowedDepartments={["development"]}
					>
						<ComingSoon title="Web development" />
					</ProtectedRoutes>
				),
			},

			// ✅ SETTLEMENT
			{
				path: "settlement",
				element: (
					<ProtectedRoutes
						allowedRoles={["user", "admin", "superadmin"]}
						allowedDepartments={["settlement"]}
					>
						<ComingSoon title="settlement" />
					</ProtectedRoutes>
				),
			},

			// ✅ USERS
			{
				path: "users",
				element: (
					<ProtectedRoutes allowedRoles={["superadmin", "admin"]}>
						<Users />
					</ProtectedRoutes>
				),
			},
		],
	},

	// ✅ TASK MANAGER
	{
		path: "tasks",
		element: (
			<ProtectedRoutes
				allowedRoles={["superadmin", "admin", "user"]}
				allowedDepartments={[
					"sales",
					"finance",
					"recon",
					"support",
					"management",
					"development",
					"settlement",
				]}
			>
				<TaskLayout />
			</ProtectedRoutes>
		),
		errorElement: <ErrorBoundary />,
		children: [
			{
				index: true,
				element: <Navigate to="analytics" replace />,
			},
			{
				path: "analytics",
				element: (
					<ProtectedRoutes
						allowedRoles={["superadmin", "admin"]}
						allowedDepartments={["management"]}
					>
						<Analytics />
					</ProtectedRoutes>
				),
			},
			{
				path: "mytasks",
				element: <MyTasks />,
			},
			{
				path: "workspaces",
				element: <Workspaces />,
			},
			{
				path: "workspaces/:id",
				element: <WorkspaceDetails />,
			},
			{
				path: "members",
				element: (
					<ProtectedRoutes allowedRoles={["superadmin", "admin"]}>
						<TeamMembers />
					</ProtectedRoutes>
				),
			},
			{
				path: "notifications",
				element: <Notifications />,
			},
		],
	},

	// ✅ LOGIN PAGE
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/forgot-password",
		element: <ForgotPassword />,
	},

	{
		path: "/reset-password/:token",
		element: <NewPassword />,
	},
	// ✅ UNAUTHORIZED
	{
		path: "/unauthorized",
		element: <Unauthorized />,
	},

	// ✅ CATCH ALL (NOT FOUND)
	{
		path: "*",
		element: <NotFound />,
	},
]);

export default router;
