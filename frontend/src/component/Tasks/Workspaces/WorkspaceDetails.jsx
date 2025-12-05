import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import KanbanBoard from "../MyTasks/KanbanBoard";
import AssignTaskModal from "../../Tasks/Workspaces/AssignTaskModal";
import { selectCurrentUser } from "../../../store/slices/Auth.slice";

import {
  setActiveWorkspace,
  setWorkspaceColumns,
  saveWorkspaceColumns,
  selectActiveWorkspace,
  selectWorkspaceLoading,
  addTaskToWorkspaceTodo,
} from "../../../store/slices/Workspaces.slice";

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

const WorkspaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = useSelector(selectCurrentUser);

  const hasPermission =
    currentUser?.role === "admin" || currentUser?.role === "superadmin";

  const workspace = useSelector(selectActiveWorkspace);
  const loading = useSelector(selectWorkspaceLoading);

  // ✅ debounce timer ref
  const saveTimerRef = useRef(null);

  useEffect(() => {
    if (id) dispatch(setActiveWorkspace(id));
  }, [id, dispatch]);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignWorkspace, setAssignWorkspace] = useState(null);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-800 min-h-screen flex justify-center items-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!workspace)
    return (
      <div className="p-6 bg-gray-50 h-screen flex justify-center items-center text-2xl">
        Workspace not found
      </div>
    );

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/tasks/workspaces");
  };

  const openAssignModal = () => {
    setAssignWorkspace(workspace);
    setAssignOpen(true);
  };

  const closeAssignModal = () => {
    setAssignOpen(false);
    setAssignWorkspace(null);
  };

  const handleColumnsChange = (newCols) => {
    dispatch(
      setWorkspaceColumns({
        workspaceSlug: workspace.slug,
        columns: newCols,
      })
    );

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      // console.log("✅ Final Workspace Columns Saved:", newCols);

      dispatch(
        saveWorkspaceColumns({
          workspaceSlug: workspace.slug,
          columns: newCols,
        })
      );
    }, 700);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            onClick={handleBack}
            className="btn btn-ghost btn-sm btn-circle"
            title="Back"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white capitalize">
              {workspace.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {workspace.description}
            </p>
          </div>
        </div>

        {hasPermission && (
          <button
            onClick={openAssignModal}
            className="btn btn-primary btn-sm md:btn-md gap-2"
          >
            <Plus size={16} />
            Assign Task
          </button>
        )}
      </div>

      {/* ✅ Board always stays mounted */}
      <KanbanBoard
        initialColumns={workspace.columns || []}
        onColumnsChange={handleColumnsChange}
      />

      <AssignTaskModal
        open={assignOpen}
        onClose={closeAssignModal}
        members={workspace.members || []}
        onAssign={(data) => {
          const newTask = {
            id: crypto.randomUUID(),
            title: data.taskName,
            description: data.description || "",
            assignees: data.assignees, // ✅ selected members
            dueDate: data.dueDate,
            priority: data.priority,
            attachments: serializeAttachments(data.attachments || []), // ✅ SERIALIZED HERE
            tags: ["New"],
            createdOn: new Date().toISOString(),
            isCompleted: false,
            status: "todo",
          };

          // console.log("new assigned task is:", newTask);

          dispatch(
            addTaskToWorkspaceTodo({
              workspaceSlug: workspace.slug,
              task: newTask,
            })
          );

          closeAssignModal();
        }}
      />
    </div>
  );
};

export default WorkspaceDetails;
