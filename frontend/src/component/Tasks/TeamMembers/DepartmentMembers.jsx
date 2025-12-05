// src/components/DepartmentMembers.jsx
import React, { useMemo } from "react";
import MemberCard from "./MemberCard";

const departmentsOrder = [
  "management",
  "sales",
  "support",
  "finance",
  "recon",
  "others",
];

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return `${first}${last}`.toUpperCase();
};

const rolePriority = {
  superadmin: 0,
  admin: 1,
  editor: 2,
  user: 3,
  others: 4,
};

const DepartmentMembers = ({
  users = [],
  searchTerm = "",
  selectable = false,
  selectedMemberIds = [],
  onToggleMember,
}) => {
  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const name = u.username?.toLowerCase() || "";
      const email = u.email?.toLowerCase() || "";
      const dept = u.department?.toLowerCase() || "";
      return name.includes(q) || email.includes(q) || dept.includes(q);
    });
  }, [users, searchTerm]);

  const usersByDepartment = useMemo(() => {
    return filteredUsers.reduce((acc, user) => {
      const dept = user.department?.toLowerCase() || "others";
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(user);
      return acc;
    }, {});
  }, [filteredUsers]);

  return (
    <div className="space-y-8">
      {departmentsOrder.map((deptKey) => {
        const deptUsers = usersByDepartment[deptKey];
        if (!deptUsers || deptUsers.length === 0) return null;

        const label =
          deptKey === "others"
            ? "Others"
            : deptKey.charAt(0).toUpperCase() + deptKey.slice(1);

        const sortedDeptUsers = [...deptUsers].sort((a, b) => {
          const aRole = (a.role || "others").toLowerCase();
          const bRole = (b.role || "others").toLowerCase();
          const aPri = rolePriority[aRole] ?? rolePriority.others;
          const bPri = rolePriority[bRole] ?? rolePriority.others;

          if (aPri !== bPri) return aPri - bPri;
          return (a.username || "").localeCompare(b.username || "");
        });

        return (
          <section key={deptKey}>
            <h2 className="text-gray-900 dark:text-gray-100 text-[20px] sm:text-[22px] font-bold leading-tight tracking-[-0.015em] px-1 sm:px-0 pb-3">
              {label}
            </h2>

            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
              {sortedDeptUsers.map((user) => {
                const role = user.role || "user";
                const roleLower = role.toLowerCase();

                const roleColor =
                  roleLower === "superadmin" || roleLower === "admin"
                    ? "purple"
                    : roleLower === "editor"
                    ? "green"
                    : "blue";

                return (
                  <MemberCard
                    key={user._id}
                    userId={user._id}
                    name={user.username}
                    email={user.email}
                    role={role}
                    roleColor={roleColor}
                    initials={getInitials(user.username)}
                    createdAt={user.createdAt}
                    selectable={selectable}
                    checked={selectedMemberIds.includes(user._id)}
                    onToggle={() => onToggleMember?.(user._id)}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      {searchTerm.trim() && filteredUsers.length === 0 && (
        <div className="text-center text-xl text-gray-500 dark:text-gray-400 py-10">
          No users found for “{searchTerm}”
        </div>
      )}
    </div>
  );
};

export default DepartmentMembers;
