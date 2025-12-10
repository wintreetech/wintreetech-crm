import { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import Column from "./Column";
import TaskDetailsModal from "./TaskDetailsModal";
import { useDispatch, useSelector } from "react-redux";
import { selectActiveWorkspace } from "../../../store/slices/Workspaces.slice";
import { deleteTask } from "../../../store/slices/Tasks.slice";
import { selectCurrentUser } from "../../../store/slices/Auth.slice";

// UI-only titles (NOT stored in DB)
const COLUMN_CONFIG = {
  todo: "Todo",
  inprogress: "In Progress",
  completed: "Completed",
};

// ✅ NEW: serialize File objects before sending to redux
const serializeAttachments = (atts = []) =>
  (atts || []).map((a) =>
    a instanceof File
      ? {
          name: a.name,
          size: a.size,
          type: a.type,
          lastModified: a.lastModified,
        }
      : a
  );

const KanbanBoard = ({
  scope = "mytasks",
  initialColumns = [],
  onColumnsChange,
  onEditTask,
}) => {
  const [columns, setColumns] = useState([]);
  const dispatch = useDispatch();
  const workspace = useSelector(selectActiveWorkspace);

  const currentUser = useSelector(selectCurrentUser);
  const hasPermission =
    currentUser?.role === "admin" || currentUser?.role === "superadmin";

  // ✅ edit visibility based on scope
  const showEdit = scope === "mytasks" ? true : hasPermission;

  // ---------------------------
  // ✅ UI CALCULATIONS (ONLY HERE)
  // ---------------------------

  // priority styles → computed ONCE
  const priorityStyles = {
    urgent: "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200",
    high: "bg-red-200 text-red-700 dark:bg-red-700 dark:text-red-200",
    medium:
      "bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-200",
    low: "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200",
  };

  const getTagColor = (tag) => {
    if (tag?.toLowerCase?.() === "new") {
      return "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300";
    }
    return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200";
  };

  const computeDueLabel = (rawDue, completed) => {
    if (completed) return "Done";
    if (!rawDue) return "";

    // old string safety
    const isISO = /^\d{4}-\d{2}-\d{2}$/.test(rawDue);
    if (!isISO) return rawDue;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(rawDue);
    due.setHours(0, 0, 0, 0);

    const diffMs = due - today;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due Today";
    if (diffDays === 1) return "1 day left";
    return `${diffDays} days left`;
  };

  const getStatusColor = (label) => {
    const d = label?.toLowerCase?.() || "";

    if (d === "done") return "text-green-600 dark:text-green-400";
    if (d === "overdue") return "text-red-600 dark:text-red-400";
    if (d.includes("due today")) return "text-red-600 dark:text-red-400";

    if (d.includes("days left") || d.includes("day left") || d.includes("due:"))
      return "text-orange-600 dark:text-orange-400";

    return "text-gray-500 dark:text-gray-400";
  };

  const enrichTask = (task) => {
    const dueLabel = computeDueLabel(task.dueDate, task.isCompleted);

    const finalStatusColor = task.statusColor || getStatusColor(dueLabel);
    const finalTagColor =
      task.tagColor || (task.tags?.length > 0 ? getTagColor(task.tags[0]) : "");

    const priorityClass =
      priorityStyles[task.priority] ||
      "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200";

    return {
      ...task,
      dueLabel,
      finalStatusColor,
      finalTagColor,
      priorityClass,
    };
  };

  // Clean initialColumns by removing title + enriching tasks
  useEffect(() => {
    const cleaned = initialColumns.map((col) => {
      const { title, ...rest } = col; // remove unwanted title field

      return {
        ...rest,
        tasks: rest.tasks?.map(enrichTask) || [],
      };
    });

    setColumns(cleaned);
  }, [initialColumns]);

  // modal state
  const [activeTask, setActiveTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    setColumns((prevColumns) => {
      const newColumns = structuredClone(prevColumns);

      const sourceCol = newColumns.find((col) => col.id === source.droppableId);
      const destinationCol = newColumns.find(
        (col) => col.id === destination.droppableId
      );

      if (!sourceCol || !destinationCol) return prevColumns;

      const draggedTask = sourceCol.tasks.find((t) => t.id === draggableId);
      if (!draggedTask) return prevColumns;

      // ✅ ONLY NEW CHANGE: sync isCompleted with destination column
      draggedTask.isCompleted = destination.droppableId === "completed";

      // remove + insert
      sourceCol.tasks.splice(source.index, 1);
      destinationCol.tasks.splice(destination.index, 0, draggedTask);

      // send clean data to parent (WITHOUT UI-only fields)
      onColumnsChange?.(
        newColumns.map((col) => {
          const { title, tasks, ...cleanCol } = col;

          return {
            ...cleanCol,
            tasks: tasks.map((t) => {
              const {
                dueLabel,
                finalStatusColor,
                finalTagColor,
                priorityClass,
                ...cleanTask
              } = t;

              return {
                ...cleanTask,
                // ✅ NEW: make attachments serializable before redux save
                attachments: serializeAttachments(cleanTask.attachments),
              };
            }),
          };
        })
      );

      // console.log("new columns is:", newColumns);

      return newColumns;
    });
  };

  const handleOpenTask = (task, columnId) => {
    const columnTitle = COLUMN_CONFIG[columnId] || "";
    // task is ALREADY enriched from parent
    setActiveTask({ ...task, columnId, columnTitle });
    setModalOpen(true);
  };

  // ✅ edit click handled here (for now opens same modal)
  const handleEditTask = (columnId, task) => {
    onEditTask?.(task, columnId);
  };

  const handleClose = () => {
    setModalOpen(false);
    setActiveTask(null);
  };

  const handleDeleteTask = (columnId, taskId) => {
    const ok = window.confirm("Are you sure you want to delete this task?");
    if (!ok) return;

    dispatch(
      deleteTask({
        scope,
        workspaceSlug: scope === "workspace" ? workspace?.slug : null,
        columnId,
        taskId,
      })
    );
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              title={COLUMN_CONFIG[column.id]} // UI title only
              onTaskExpand={handleOpenTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
              showEdit={showEdit}
            />
          ))}
        </div>
      </DragDropContext>

      <TaskDetailsModal
        open={modalOpen}
        task={activeTask}
        onClose={handleClose}
      />
    </>
  );
};

export default KanbanBoard;
