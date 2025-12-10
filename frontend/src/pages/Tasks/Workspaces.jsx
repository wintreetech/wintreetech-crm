import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import WorkspaceRow from "../../component/Tasks/Workspaces/WorkspaceRow";
import AssignTaskModal from "../../component/Tasks/Workspaces/AssignTaskModal";
import AddWorkspaceModal from "../../component/Tasks/Workspaces/AddWorkspaceModal";

import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser } from "../../store/slices/Auth.slice";

// ✅ NEW imports from slice
import {
  addWorkspace,
  setActiveWorkspace,
  selectWorkspaces,
  selectActiveWorkspace,
  addTaskToWorkspaceTodo,
} from "../../store/slices/Workspaces.slice";

// ✅ simple slugify helper (same logic as before)
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

// ✅ empty columns in your required format
const makeEmptyColumns = () => [
  { id: "todo", tasks: [] },
  { id: "inprogress", tasks: [] },
  { id: "completed", tasks: [] },
];

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

const Workspaces = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  // Assign modal state
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignWorkspace, setAssignWorkspace] = useState(null);

  const currentUser = useSelector(selectCurrentUser);
  const workspace = useSelector(selectActiveWorkspace);

  const hasPermission =
    currentUser?.role === "admin" || currentUser?.role === "superadmin";

  // ✅ CHANGED: list from redux
  const workspaces = useSelector(selectWorkspaces);

  const defaultMembers = [
    { name: "Alisa Hester", role: "Marketing Lead", avatar: "..." },
    { name: "Fariha Hopkins", role: "Content Strategist", avatar: "..." },
    { name: "Leo Wilkinson", role: "Graphic Designer", avatar: "..." },
    { name: "Amara Vance", role: "SEO Specialist", avatar: "..." },
  ];

  const openAssignModal = (ws) => {
    setAssignWorkspace(ws);
    setAssignOpen(true);
  };

  const closeAssignModal = () => {
    setAssignOpen(false);
    setAssignWorkspace(null);
  };

  // ✅ CHANGED: set slug in redux, then navigate
  const handleRowClick = (ws) => {
    dispatch(setActiveWorkspace(ws.slug));
    navigate(`/tasks/workspaces/${ws.slug}`);
  };

  // ✅ CHANGED: add into redux list (not local array)
  const handleAddWorkspace = ({ title, description }) => {
    const newWorkspace = {
      id: crypto.randomUUID(),
      title,
      description: description || "",
      slug: `${slugify(title)}-${Date.now()}`,

      createdOn: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),

      createdBy: currentUser
        ? { id: currentUser.id, username: currentUser.username }
        : { id: null, username: "Unknown" },
      members: [],
      columns: makeEmptyColumns(),
    };

    dispatch(addWorkspace(newWorkspace));

    console.log("✅ Workspace Added:", newWorkspace);

    setAddOpen(false);
  };

  // ✅ NEW: role-based visibility
  const visibleWorkspaces =
    currentUser?.role === "superadmin"
      ? workspaces
      : workspaces.filter((ws) =>
          (ws.members || []).some((m) => {
            // match by _id OR email OR username (covers your dummy + real cases)
            return (
              (currentUser?.id && m._id === currentUser.id) ||
              (currentUser?.email &&
                m.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
              (currentUser?.username &&
                m.username?.toLowerCase() ===
                  currentUser.username.toLowerCase())
            );
          })
        );

  // ✅ search should apply AFTER role filtering
  const filteredWorkspaces = visibleWorkspaces.filter((ws) =>
    ws.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-display bg-gray-50 dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark min-h-screen">
      <div className="flex min-h-screen">
        <main className="flex-1 min-w-0 p-6">
          <div className="w-full max-w-7xl mx-auto">
            <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <h1 className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white">
                Your Workspaces
              </h1>

              {hasPermission && (
                <button
                  onClick={() => setAddOpen(true)}
                  className="btn btn-primary flex min-w-[84px] items-center justify-center gap-2 h-10 px-4 text-sm font-bold tracking-[0.015em] capitalize"
                >
                  <Plus size={16} className="shrink-0" />
                  <span className="truncate">Workspace</span>
                </button>
              )}
            </header>

            <div className="mb-4">
              <label className="flex flex-col min-w-40 w-full max-w-md">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary">
                  <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center pl-4">
                    <Search size={18} />
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 text-gray-900 dark:text-gray-100 focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 py-2 pl-2 text-base"
                    placeholder="Search by workspace name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </label>
            </div>

            <div className="w-full min-w-0 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-max w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="px-6 py-3">Workspace Name</th>
                    <th className="px-6 py-3">Members</th>
                    <th className="px-6 py-3 text-center">Active Tasks</th>
                    <th className="px-6 py-3">Created On</th>
                    {hasPermission && <th className="px-6 py-3" />}
                  </tr>
                </thead>

                <tbody className="divide-y divide-border-light dark:divide-border-dark border-t border-border-light dark:border-border-dark">
                  {filteredWorkspaces.map((ws) => (
                    <WorkspaceRow
                      key={ws.id}
                      workspace={ws}
                      onRowClick={handleRowClick}
                      onAssignClick={openAssignModal}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Assign modal */}
      <AssignTaskModal
        open={assignOpen}
        onClose={closeAssignModal}
        members={
          assignWorkspace?.members?.length
            ? assignWorkspace.members
            : defaultMembers
        }
        onAssign={(data) => {
          const newTask = {
            id: crypto.randomUUID(),
            title: data.taskName,
            description: data.description || "",
            assignees: data.assignees, // ✅ selected members
            dueDate: data.dueDate,
            priority: data.priority,
            attachments: serializeAttachments(data.attachments || []),
            tags: ["New"],
            createdOn: new Date().toISOString(),
            isCompleted: false,
            status: "todo",
          };

          // console.log(
          //   "Assign Task Data from workspace:",
          //   assignWorkspace?.title,
          //   newTask
          // );

          dispatch(
            addTaskToWorkspaceTodo({
              workspaceSlug: assignWorkspace.slug,
              task: newTask,
            })
          );

          closeAssignModal();
        }}
      />

      {/* Add workspace modal */}
      <AddWorkspaceModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAddWorkspace}
      />
    </div>
  );
};

export default Workspaces;
