import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

// Components
import KanbanBoard from "../MyTasks/KanbanBoard";
import AssignTaskModal from "../../Tasks/Workspaces/AssignTaskModal";

// State & Sockets
import { selectCurrentUser } from "../../../store/slices/Auth.slice";
import {
  setActiveWorkspace,
  setWorkspaceColumns,
  selectActiveWorkspace,
  selectWorkspaceLoading,
  addTaskToWorkspaceTodo,
  fetchWorkspaces,
  selectWorkspaces,
} from "../../../store/slices/Workspaces.slice";
import {
  joinWorkspaceRoom,
  leaveWorkspaceRoom,
  registerWorkspaceSocket,
} from "../../../socket/workspace.socket";

// Helpers
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

const WorkspaceDetails = () => {
  const { id: slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux Selectors
  const currentUser = useSelector(selectCurrentUser);
  const workspaces = useSelector(selectWorkspaces);
  const workspace = useSelector(selectActiveWorkspace);
  const loading = useSelector(selectWorkspaceLoading);

  // Local State
  const [assignOpen, setAssignOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const hasPermission =
    currentUser?.role === "admin" || currentUser?.role === "superadmin";

  // Load workspace data
  useEffect(() => {
    if (workspaces.length === 0 && !loading) {
      dispatch(fetchWorkspaces());
    }
    if (slug) dispatch(setActiveWorkspace(slug));
  }, [slug, workspaces.length, dispatch, loading]);

  // Socket Lifecycle management
  useEffect(() => {
    if (workspace?.id && workspace?.slug) {
      joinWorkspaceRoom(workspace.id);
      registerWorkspaceSocket(workspace.slug);
    }

    return () => {
      if (workspace?.id) leaveWorkspaceRoom(workspace.id);
    };
  }, [workspace?.id, workspace?.slug]);

  // Handlers
  const handleBack = () => {
    window.history.length > 1 ? navigate(-1) : navigate("/tasks/workspaces");
  };

  const openAssignModal = () => {
    setTaskToEdit(null);
    setAssignOpen(true);
  };

  const openEditTaskModal = (task, columnId) => {
    setTaskToEdit({ ...task, columnId });
    setAssignOpen(true);
  };

  const closeAssignModal = () => {
    setAssignOpen(false);
    setTaskToEdit(null);
  };

  const handleColumnsChange = (newCols) => {
    dispatch(
      setWorkspaceColumns({
        workspaceSlug: workspace.slug,
        columns: newCols,
      })
    );
  };

  const onTaskSubmit = (data) => {
    if (data?.isEdit && taskToEdit?.id) {
      // Handle Edit Logic
      const updatedColumns = (workspace.columns || []).map((col) => {
        const colKey = String(col?.id || col?.title || "")
          .toLowerCase()
          .replace(/\s+/g, "-");
        const targetKey = String(taskToEdit.columnId || "")
          .toLowerCase()
          .replace(/\s+/g, "-");

        if (colKey !== targetKey) return col;

        return {
          ...col,
          tasks: (col.tasks || []).map((t) =>
            String(t.id) === String(taskToEdit.id)
              ? {
                  ...t,
                  title: data.taskName,
                  description: data.description || "",
                  assignees: data.assignees,
                  dueDate: data.dueDate,
                  priority: data.priority,
                  attachments: serializeAttachments(data.attachments || []),
                }
              : t
          ),
        };
      });

      handleColumnsChange(updatedColumns);
    } else {
      // Handle Create Logic
      const newTask = {
        id: crypto.randomUUID(),
        title: data.taskName,
        description: data.description || "",
        assignees: data.assignees,
        dueDate: data.dueDate,
        priority: data.priority,
        attachments: serializeAttachments(data.attachments || []),
        tags: ["New"],
        createdOn: new Date().toISOString(),
        isCompleted: false,
        status: "todo",
      };

      dispatch(
        addTaskToWorkspaceTodo({
          workspaceSlug: workspace.slug,
          task: newTask,
        })
      );
    }
    closeAssignModal();
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-800 min-h-screen flex justify-center items-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-800 h-screen flex justify-center items-center text-2xl dark:text-white">
        Workspace not found
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={handleBack}
            className="btn btn-ghost btn-sm btn-circle shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white capitalize break-words">
              {workspace.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 break-words">
              {workspace.description}
            </p>
          </div>
        </div>

        {hasPermission && workspace.members?.length > 0 && (
          <button
            onClick={openAssignModal}
            className="btn btn-primary btn-sm md:btn-md gap-2 w-full md:w-auto"
          >
            <Plus size={16} />
            Assign Task
          </button>
        )}
      </div>

      <KanbanBoard
        scope="workspace"
        initialColumns={workspace.columns || []}
        onColumnsChange={handleColumnsChange}
        onEditTask={openEditTaskModal}
      />

      <AssignTaskModal
        open={assignOpen}
        onClose={closeAssignModal}
        members={workspace.members || []}
        initialData={taskToEdit}
        onAssign={onTaskSubmit}
      />
    </div>
  );
};

export default WorkspaceDetails;
