import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom"; // <- use react-router-dom
import { decryptData } from "../utils/cryptoUtils"; // adjust the path

function ProtectedRoutes({
  children,
  allowedRoles = [],
  allowedDepartments = [],
}) {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [user, setUser] = useState(null);

  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const stored = localStorage.getItem("currentUser");
        if (!stored) {
          if (mounted) setUser(null);
          return;
        }

        // Decrypt the Base64 string from localStorage
        const u = await decryptData(stored);
        if (mounted) setUser(u);
      } catch {
        // If decrypt fails (e.g., key changed or old data), treat as logged out
        localStorage.removeItem("currentUser");
        if (mounted) setUser(null);
      } finally {
        if (mounted) setBootstrapping(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // While we’re decrypting, show a tiny loader (or return null if you prefer)
  if (bootstrapping) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  // If not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // ✅ Allow superadmin full access (no department restriction)
  if (user.role === "superadmin") {
    return children;
  }

  // Role check
  const hasRoleAccess =
    allowedRoles.length === 0 || allowedRoles.includes(user.role);

  // Department check (normalize to lowercase)
  const userDept = (user.department || "").toLowerCase();
  const allowedDeptLower = allowedDepartments.map((d) => d.toLowerCase());
  const hasDepartmentAccess =
    allowedDepartments.length === 0 || allowedDeptLower.includes(userDept);

  // If both role and department pass → allow
  if (hasRoleAccess && hasDepartmentAccess) {
    return children;
  }

  //  If user is denied on "/" or "/dashboard"
  if (location.pathname === "/" || location.pathname === "/dashboard") {
    if (userDept) {
      return <Navigate to={`/${userDept}`} replace />;
    }
  }

  if (
    location.pathname === "/tasks/analytics" ||
    location.pathname === "/tasks/members"
  ) {
    if (userDept) {
      return <Navigate to="/tasks/mytasks" replace />;
    }
  }

  // Else → redirect unauthorized
  return <Navigate to="/unauthorized" replace />;
}

export default ProtectedRoutes;
