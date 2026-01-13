import { useEffect, useRef, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import Column from "./Column";
import TaskDetailsModal from "./TaskDetailsModal";
import { useDispatch, useSelector } from "react-redux";
import { selectActiveWorkspace } from "../../../store/slices/Workspaces.slice";
import { deleteTask } from "../../../store/slices/Tasks.slice";
import { selectCurrentUser } from "../../../store/slices/Auth.slice";

const COLUMN_CONFIG = {
  todo: "Todo",
  inprogress: "In Progress",
  completed: "Completed",
};

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
  const showEdit = scope === "mytasks" ? true : hasPermission;

  // --- UI COMPUTATIONS ---
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
    if (d === "overdue" || d.includes("due today"))
      return "text-red-600 dark:text-red-400";
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

  const toPersistableColumns = (cols) =>
    cols.map((col) => {
      const { title, tasks, ...cleanCol } = col;
      return {
        ...cleanCol,
        tasks: (tasks || []).map((t) => {
          const {
            dueLabel,
            finalStatusColor,
            finalTagColor,
            priorityClass,
            ...cleanTask
          } = t;
          return {
            ...cleanTask,
            attachments: serializeAttachments(cleanTask.attachments),
          };
        }),
      };
    });

  // --- EFFECTS ---

  // Sync Redux -> Local State (e.g., on mount or when another user updates via socket)
  useEffect(() => {
    const cleaned = initialColumns.map((col) => {
      const { title, ...rest } = col;
      return {
        ...rest,
        tasks: rest.tasks?.map(enrichTask) || [],
      };
    });
    setColumns(cleaned);
  }, [initialColumns]);

  // --- HANDLERS ---

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const newColumns = structuredClone(columns);
    const sourceCol = newColumns.find((col) => col.id === source.droppableId);
    const destinationCol = newColumns.find(
      (col) => col.id === destination.droppableId
    );

    if (!sourceCol || !destinationCol) return;

    const draggedTask = sourceCol.tasks.find((t) => t.id === draggableId);
    if (!draggedTask) return;

    // Update status based on column
    draggedTask.isCompleted = destination.droppableId === "completed";
    draggedTask.status = destination.droppableId; // Sets it to "todo", "inprogress", or "completed"

    // Move task
    sourceCol.tasks.splice(source.index, 1);
    destinationCol.tasks.splice(destination.index, 0, draggedTask);

    // Update local state for instant UI response
    setColumns(newColumns);

    // 🔥 NOTIFY REDUX IMMEDIATELY (Manual trigger prevents the spam loop)
    onColumnsChange?.(toPersistableColumns(newColumns));
  };

  const handleDeleteTask = (columnId, taskId) => {
    const ok = window.confirm("Are you sure you want to delete this task?");
    if (!ok) return;

    // CAPTURE DATA BEFORE DELETION FOR s3
    const sourceColumn = columns.find((c) => c.id === columnId);
    const taskToCleanup = sourceColumn?.tasks?.find(
      (t) => String(t.id) === String(taskId)
    );

    if (!taskToCleanup) {
      console.error("Could not find task to cleanup in local state");
      return;
    }

    // DISPATCH WITH EXPLICIT DATA
    dispatch(
      deleteTask({
        scope,
        workspaceSlug: scope === "workspace" ? workspace?.slug : null,
        columnId,
        taskId,
        // Pass the specific info needed for S3 cleanup
        attachmentKeys: taskToCleanup.attachments?.map((att) => att.key) || [],
        taskTitle: taskToCleanup.title,
        hasAttachments: taskToCleanup.attachments?.length > 0,
      })
    );

    // UPDATE LOCAL UI
    const newCols = structuredClone(columns);
    const col = newCols.find((c) => c.id === columnId);
    if (col) {
      col.tasks = (col.tasks || []).filter(
        (t) => String(t.id) !== String(taskId)
      );
      setColumns(newCols);
      onColumnsChange?.(toPersistableColumns(newCols));
    }
  };

  // --- MODAL LOGIC ---
  const [activeTask, setActiveTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenTask = (task, columnId) => {
    const columnTitle = COLUMN_CONFIG[columnId] || "";
    setActiveTask({ ...task, columnId, columnTitle });
    setModalOpen(true);
  };

  const handleEditTask = (columnId, task) => {
    onEditTask?.(task, columnId);
  };

  const handleClose = () => {
    setModalOpen(false);
    setActiveTask(null);
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              title={COLUMN_CONFIG[column.id]}
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
