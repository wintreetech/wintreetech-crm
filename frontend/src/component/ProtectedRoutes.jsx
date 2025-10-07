import React from "react";
import { Navigate } from "react-router";

function ProtectedRoutes({
	children,
	allowedRoles = [],
	allowedDepartments = [],
}) {
	// Get logged in user from localStorage
	const user = JSON.parse(localStorage.getItem("currentUser"));

	if (!user) {
		// If not logged in → redirect to login
		return <Navigate to="/login" replace />;
	}

	// ✅ Allow superadmin full access (no department restriction)
	if (user.role === "superadmin") {
		return children;
	}

	// Role check
	const hasRoleAccess =
		allowedRoles.length === 0 || allowedRoles.includes(user.role);

	// Department check
	const hasDepartmentAccess =
		allowedDepartments.length === 0 ||
		allowedDepartments.includes(user.department?.toLowerCase());

	// If both role and department pass → allow
	if (hasRoleAccess && hasDepartmentAccess) {
		return children;
	}

	// Else → redirect unauthorized
	return <Navigate to="/unauthorized" replace />;
}

export default ProtectedRoutes;
