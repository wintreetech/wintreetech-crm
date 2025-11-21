import { createBrowserRouter } from "react-router";
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

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes allowedRoles={["user", "admin", "superadmin"]}>
        <App />
      </ProtectedRoutes>
    ),
    children: [
      // ✅ DASHBOARD
      {
        path: "dashboard",
        element: (
          <ProtectedRoutes
            allowedRoles={["superadmin", "admin"]}
            allowedDepartments={[
              "sales",
              "finance",
              "recon",
              "support",
              "management",
            ]}
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

  // ✅ LOGIN PAGE
  {
    path: "/login",
    element: <Login />,
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
