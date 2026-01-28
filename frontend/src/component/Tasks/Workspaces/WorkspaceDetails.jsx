import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Users } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

// Components
import KanbanBoard from "../MyTasks/KanbanBoard";
import AssignTaskModal from "../../Tasks/Workspaces/AssignTaskModal";

// State & Sockets
import { selectCurrentUser } from "../../../store/slices/Auth.slice";
import {
  setActiveWorkspace,
  setWorkspaceColumns,
  updateWorkspaceTask,
  selectActiveWorkspace,
  selectWorkspaceLoading,
  addTaskToWorkspaceTodo,
  fetchWorkspaces,
  selectWorkspaces,
  removeSingleAttachment,
  selectIsSyncing,
} from "../../../store/slices/Workspaces.slice";
import {
  joinWorkspaceRoom,
  leaveWorkspaceRoom,
  onWorkspaceDeleted,
  onWorkspaceUpdated,
  registerWorkspaceSocket,
} from "../../../socket/workspace.socket";
import { s3Api } from "../../../api";
import toast from "react-hot-toast";

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
      : a,
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
  const isSyncing = useSelector(selectIsSyncing);

  // Local State
  const [assignOpen, setAssignOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      onWorkspaceDeleted((data) => {
        if (data.workspaceId === workspace.id || data.slug === slug) {
          toast.error("This workspace has been deleted by an admin.");
          dispatch(fetchWorkspaces());
          navigate("/tasks/workspaces");
        }
      });

      // Listen for Member Removal (Update)
      onWorkspaceUpdated((updatedWs) => {
        // Ensure we are talking about the current workspace
        if (String(updatedWs.id || updatedWs._id) === String(workspace.id)) {
          const userId = String(currentUser?.id || currentUser?._id);

          // Check if I am still a member
          const stillMember = updatedWs.members?.some(
            (m) => String(m.id || m._id) === userId,
          );

          // If I'm not a member and not a superadmin, kick me out immediately
          if (!stillMember && currentUser?.role !== "superadmin") {
            toast.error("Your access to this workspace has been revoked.");
            dispatch(fetchWorkspaces()); // Refresh list to remove it from sidebar/dashboard
            navigate("/tasks/workspaces", { replace: true });
          }
        }
      });
    }

    return () => {
      if (workspace?.id) leaveWorkspaceRoom(workspace.id);
    };
  }, [workspace?.id, workspace?.slug, navigate, slug]);

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
      }),
    );
  };

  const onTaskSubmit = async (data) => {
    const workspaceSlug = workspace.slug;

    setIsSubmitting(true);

    try {
      if (data?.isEdit && taskToEdit?.id) {
        // 1. Separate new files from existing S3 files
        const newFiles = (data.attachments || []).filter(
          (f) => f instanceof File,
        );
        const existingS3Files = (data.attachments || []).filter(
          (f) => !(f instanceof File),
        );

        // 2. Dispatch centralized action (triggers Middleware upload)
        dispatch(
          updateWorkspaceTask({
            workspaceSlug,
            taskId: taskToEdit.id,
            rawFiles: newFiles, // Trigger S3 upload in middleware
            updates: {
              title: data.taskName,
              description: data.description || "",
              assignees: data.assignees,
              dueDate: data.dueDate,
              priority: data.priority,
              attachments: existingS3Files, // Keep existing URLs
            },
          }),
        );
      } else {
        // Handle Create Logic (Keep as is, but ensure rawFiles is passed)
        const newTask = {
          id: crypto.randomUUID(),
          title: data.taskName,
          description: data.description || "",
          assignees: data.assignees,
          dueDate: data.dueDate,
          priority: data.priority,
          attachments: [],
          tags: ["New"],
          createdBy: currentUser?.username,
          createdOn: new Date().toISOString(),
          isCompleted: false,
          status: "todo",
        };

        dispatch(
          addTaskToWorkspaceTodo({
            workspaceSlug,
            task: newTask,
            rawFiles: data.attachments, // Trigger S3 upload in middleware
          }),
        );
      }
      // closeAssignModal();
    } catch (error) {
      console.error("Submission failed:", error);
      setIsSubmitting(false);
    }
  };

  const handleDeleteAttachment = async (taskId, fileKey) => {
    try {
      // Delete from S3 physically
      await s3Api.post("/delete-file", { key: fileKey });

      // Update local Redux state
      dispatch(removeSingleAttachment({ taskId, fileKey }));
    } catch (error) {
      console.error("Delete Attachment Failed:", error);
    }
  };

  // Watch for the loading state to finish
  useEffect(() => {
    if (isSubmitting && !isSyncing) {
      setAssignOpen(false);
      setTaskToEdit(null);
      setIsSubmitting(false);
    }
  }, [isSyncing, loading, isSubmitting]);

  useEffect(() => {
    if (!loading && workspaces.length > 0 && slug && !workspace) {
      navigate("/tasks/workspaces");
    }
  }, [loading, workspaces, workspace, slug, navigate]);

  if (loading && !workspace) {
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

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="btn btn-outline btn-primary dark:border-primary dark:text-primary dark:hover:bg-primary dark:hover:text-white"
            >
              <Users size={19} />
            </label>

            <div
              tabIndex={0}
              className="dropdown-content z-[50] mt-2 card w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl right-0 origin-top-right"
            >
              <div className="card-body p-4">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                  Members ({workspace.members.length})
                </h3>

                <ul className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                  {workspace.members.map((member) => (
                    <li
                      key={member.id}
                      className="text-sm px-3 py-2 rounded-lg capitalize text-gray-700 dark:text-gray-300 transition-colors cursor-default"
                    >
                      <div className="flex items-center gap-2">
                        {member.username}
                      </div>
                    </li>
                  ))}
                </ul>

                {workspace.members.length === 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 text-center py-2">
                    No members found
                  </p>
                )}
              </div>
            </div>
          </div>
          {hasPermission && workspace.members?.length > 0 && (
            <button
              onClick={openAssignModal}
              className="btn btn-primary btn-sm md:btn-md gap-2 w-full sm:w-auto"
            >
              <Plus size={16} />
              Assign Task
            </button>
          )}
        </div>
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
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default WorkspaceDetails;
