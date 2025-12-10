import { Draggable } from "@hello-pangea/dnd";
import { Clock, CheckCircle, Trash, Expand, Pen } from "lucide-react";
import { getAvatarUrl, getStatusIcon } from "../../../utils/data";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../store/slices/Auth.slice";

const StatusIcon = ({ dueDate, size, className }) => {
  const iconName = getStatusIcon(dueDate);

  if (iconName === "check_circle") {
    return <CheckCircle size={size} className={className} />;
  }
  return <Clock size={size} className={className} />;
};

const TaskCard = ({
  task,
  index,
  onExpand,
  onDelete,
  onEdit,
  columnId,
  showEdit = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const currentUser = useSelector(selectCurrentUser);

  const hasPermission =
    currentUser?.role === "admin" || currentUser?.role === "superadmin";

  const {
    title,
    description,
    tags,
    assignees,
    dueLabel, // ✅ computed in parent
    finalStatusColor, // ✅ computed in parent
    finalTagColor, // ✅ computed in parent
    isCompleted,
    priority,
    priorityClass, // ✅ computed in parent
  } = task;

  const textClass = isCompleted
    ? "line-through text-gray-500 dark:text-gray-400"
    : "text-gray-900 dark:text-white";

  // ✅ NEW: same initials helper as WorkspaceRow
  const getInitials = (username = "") => {
    const parts = String(username).trim().split(/\s+/);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "";
    return (
      (parts[0][0] || "").toUpperCase() +
      (parts[parts.length - 1][0] || "").toUpperCase()
    );
  };

  const visibleAssignees = (assignees || []).slice(0, 3);
  const extraCount =
    (assignees || []).length > 3 ? (assignees || []).length - 3 : 0;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group flex flex-col rounded-lg ${
            dueLabel === "Overdue"
              ? "bg-red-100 border border-red-500 dark:bg-red-900 dark:border-red-500"
              : "bg-white border border-gray-200"
          } dark:bg-gray-800 p-4 gap-3 dark:border-gray-700/50 cursor-grab transition duration-100 ease-in-out ${
            snapshot.isDragging ? "shadow-2xl border-primary" : "shadow-none"
          }`}
        >
          <div className="flex justify-between items-start min-w-0">
            {/* Title truncate 1 line */}
            <p
              className={`text-base font-bold leading-tight ${textClass} flex-1 min-w-0 truncate`}
              title={title}
            >
              {title}
            </p>

            {/* Tags stay where they were */}
            {tags.length > 0 && (
              <span
                className={`${finalTagColor} text-xs font-medium px-2.5 py-0.5 rounded-full`}
              >
                {tags[0]}
              </span>
            )}

            <div className="ml-2">
              <button
                title="Expand"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand?.();
                }}
                className="text-gray-400 hover:bg-gray-200 hover:text-gray-500 p-1 rounded-md transition-opacity cursor-pointer opacity-0 group-hover:opacity-100 dark:hover:bg-gray-500 dark:hover:text-gray-200"
              >
                <Expand size={20} />
              </button>

              {showEdit && (
                <button
                  title="Edit"
                  className="text-gray-400 hover:bg-gray-200 hover:text-gray-500 p-1 rounded-md transition-opacity cursor-pointer opacity-0 group-hover:opacity-100 dark:hover:bg-gray-500 dark:hover:text-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(columnId, task);
                  }}
                >
                  <Pen size={20} />
                </button>
              )}

              {(dueLabel === "Overdue" || isCompleted) && (
                <button
                  title="Delete"
                  className="text-red-400 hover:bg-red-200 hover:text-red-500 p-1 rounded-md transition-opacity cursor-pointer opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(columnId, task.id);
                    console.log(columnId, task.id);
                  }}
                >
                  <Trash size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Description truncate 2 lines */}
          <p
            className={`text-sm font-normal leading-normal text-gray-500 dark:text-gray-400 line-clamp-2 ${
              isCompleted ? "line-through" : ""
            }`}
            title={description}
          >
            {description}
          </p>

          {/* Priority after description */}
          {priority?.length > 0 && (
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500"> Priority:</p>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${priorityClass}`}
              >
                {priority}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            {/* ✅ CHANGED: initials circles instead of avatars */}
            <div className="flex items-center -space-x-2">
              {visibleAssignees.map((nameOrId, i) => (
                <div
                  key={`${nameOrId}-${i}`}
                  className="inline-flex items-center justify-center size-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-primary text-white text-xs font-semibold"
                  title={String(nameOrId)}
                >
                  {getInitials(String(nameOrId))}
                </div>
              ))}

              {extraCount > 0 && (
                <span className="inline-flex items-center justify-center size-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 text-black text-xs font-semibold">
                  +{extraCount}
                </span>
              )}
            </div>

            {/* Status label computed once in parent */}
            <div className={`flex items-center gap-1.5 ${finalStatusColor}`}>
              <StatusIcon dueDate={dueLabel} size={16} />
              <p className="text-xs font-medium">{dueLabel}</p>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
