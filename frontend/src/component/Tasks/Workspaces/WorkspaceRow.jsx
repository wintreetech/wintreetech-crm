import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../store/slices/Auth.slice";

const WorkspaceRow = ({ workspace, onRowClick, onAssignClick }) => {
  const { title, createdBy, createdOn, members = [], columns = [] } = workspace;

  const currentUser = useSelector(selectCurrentUser);
  const hasPermission =
    currentUser?.role === "admin" || currentUser?.role === "superadmin";

  const getInitials = (username = "") => {
    const parts = username.trim().split(/\s+/);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "";
    return (
      (parts[0][0] || "").toUpperCase() +
      (parts[parts.length - 1][0] || "").toUpperCase()
    );
  };

  const visibleMembers = members.slice(0, 3);
  const extraCount = members.length > 3 ? members.length - 3 : 0;

  // calculate "In Progress" tasks length
  const inProgressColumn = Array.isArray(columns)
    ? columns.find((col) => {
        const key = (col?.id).toString().toLowerCase().replace(/\s+/g, "-");
        return key === "inprogress";
      })
    : null;

  const inProgressCount = inProgressColumn?.tasks?.length ?? 0;

  return (
    <tr
      onClick={() => onRowClick(workspace)}
      className="bg-white border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 cursor-pointer"
    >
      <td className="px-6 py-4 font-bold text-base text-text-primary-light dark:text-text-primary-dark capitalize">
        {title}
        <p className="text-sm text-gray-700 dark:text-gray-400 mt-0.5 font-normal">
          Created by {createdBy}
        </p>
      </td>

      <td className="px-4 py-4">
        <div className="flex -space-x-2 p-1 rounded-full">
          {visibleMembers.map((m, i) => (
            <div
              key={m._id || m.email || i}
              className=" inline-flex items-center justify-center size-9 rounded-full border-3 border-white dark:border-gray-800 bg-primary text-white text-sm font-semibold "
              title={m.username}
            >
              {getInitials(m.username)}
            </div>
          ))}
          {extraCount > 0 && (
            <span className=" flex items-center justify-center size-9 rounded-full border-3 border-white dark:border-gray-800 bg-gray-200 text-black text-sm font-semibold ">
              +{extraCount}
            </span>
          )}
        </div>
      </td>

      {/* ✅ only changed display from activeTasks to inProgressCount */}
      <td className="px-2 py-4 text-center font-medium text-text-primary-light dark:text-text-primary-dark">
        {inProgressCount}
      </td>

      <td className="px-6 py-4 text-text-secondary-light dark:text-text-secondary-dark">
        {createdOn}
      </td>

      {hasPermission && members.length !== 0 && (
        <td className="px-6 py-4">
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onAssignClick(workspace);
            }}
          >
            Assign
          </button>
        </td>
      )}
    </tr>
  );
};

export default WorkspaceRow;
