import { useMemo, useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";

// Components
import WorkspaceRow from "../../component/Tasks/Workspaces/WorkspaceRow";
import AssignTaskModal from "../../component/Tasks/Workspaces/AssignTaskModal";
import AddWorkspaceModal from "../../component/Tasks/Workspaces/AddWorkspaceModal";

// State
import { selectCurrentUser } from "../../store/slices/Auth.slice";
import {
  setActiveWorkspace,
  selectWorkspaces,
  addTaskToWorkspaceTodo,
  createWorkspace,
  fetchWorkspaces,
  deleteWorkspace,
  selectWorkspaceLoading,
} from "../../store/slices/Workspaces.slice";

// Helpers
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const makeEmptyColumns = () => [
  { id: "todo", tasks: [] },
  { id: "inprogress", tasks: [] },
  { id: "completed", tasks: [] },
];

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

  // Local State
  const [searchTerm, setSearchTerm] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignWorkspace, setAssignWorkspace] = useState(null);

  // Redux State
  const currentUser = useSelector(selectCurrentUser);
  const workspaces = useSelector(selectWorkspaces);
  const loading = useSelector(selectWorkspaceLoading);

  const hasPermission =
    currentUser?.role === "admin" || currentUser?.role === "superadmin";

  const defaultMembers = [
    { name: "Alisa Hester", role: "Marketing Lead", avatar: "..." },
    { name: "Fariha Hopkins", role: "Content Strategist", avatar: "..." },
    { name: "Leo Wilkinson", role: "Graphic Designer", avatar: "..." },
    { name: "Amara Vance", role: "SEO Specialist", avatar: "..." },
  ];

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchWorkspaces(currentUser.id));
    }
  }, [dispatch, currentUser?.id]);

  // Modal Handlers
  const openAssignModal = (ws) => {
    setAssignWorkspace(ws);
    setAssignOpen(true);
  };

  const closeAssignModal = () => {
    setAssignOpen(false);
    setAssignWorkspace(null);
  };

  const handleRowClick = (ws) => {
    dispatch(setActiveWorkspace(ws.slug));
    navigate(`/tasks/workspaces/${ws.slug}`);
  };

  const handleAddWorkspace = async ({ title, description }) => {
    const newWorkspace = {
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
      members: currentUser
        ? [
            {
              id: String(currentUser.id || currentUser._id),
              username: currentUser.username,
              email: currentUser.email,
              role: currentUser.role,
              department: currentUser.department || "",
            },
          ]
        : [],
      columns: makeEmptyColumns(),
    };

    try {
      await dispatch(createWorkspace(newWorkspace)).unwrap();

      toast.success("Workspace created successfully");
      setAddOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create workspace");
    }
  };

  // Delete an exisiting workspace
  const handleDelete = async (workspace) => {
    const { _id, slug } = workspace;

    if (window.confirm("Are you sure you want to delete this workspace?")) {
      try {
        await dispatch(deleteWorkspace({ slug, id: _id })).unwrap();
        toast.success("Workspace removed successfully");
      } catch (err) {
        toast.error(err || "Failed to delete workspace");
      }
    }
  };

  // Visibility Logic: Filter by role and membership
  const visibleWorkspaces = useMemo(() => {
    if (currentUser?.role === "superadmin") return workspaces;

    return workspaces.filter((ws) =>
      (ws.members || []).some(
        (m) =>
          (currentUser?.id &&
            (m.id === currentUser.id || m._id === currentUser.id)) ||
          (currentUser?.email &&
            m.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser?.username &&
            m.username?.toLowerCase() === currentUser.username.toLowerCase())
      )
    );
  }, [workspaces, currentUser]);

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

            {/* Search Bar */}
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

            {/* Workspaces Table */}
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

                <tbody className="divide-y divide-border-light dark:divide-border-dark border-t border-gray-200 dark:border-border-dark">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-6">
                        Loading Workspaces...
                      </td>
                    </tr>
                  ) : filteredWorkspaces.length > 0 ? (
                    filteredWorkspaces.map((ws) => (
                      <WorkspaceRow
                        key={ws.id || ws._id}
                        workspace={ws}
                        onRowClick={handleRowClick}
                        onAssignClick={openAssignModal}
                        onDeleteClick={handleDelete}
                      />
                    ))
                  ) : (
                    <tr className="bg-white dark:bg-gray-900">
                      <td
                        colSpan={hasPermission ? 5 : 4}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-base font-medium">
                            No workspaces found
                          </span>
                          <p className="text-sm opacity-70">
                            {searchTerm
                              ? "Try adjusting your search"
                              : "Create a workspace to get started"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <AssignTaskModal
        open={assignOpen}
        onClose={closeAssignModal}
        members={
          assignWorkspace?.members?.length
            ? assignWorkspace.members
            : defaultMembers
        }
        onAssign={(data) => {
          const workspaceSlug = assignWorkspace.slug;

          // HANDLE NEW TASK MODE ONLY
          const newTask = {
            id: crypto.randomUUID(),
            title: data.taskName,
            description: data.description || "",
            assignees: data.assignees,
            dueDate: data.dueDate,
            priority: data.priority,
            attachments: [], // Start empty; Middleware will fill this via S3
            tags: ["New"],
            createdOn: new Date().toISOString(),
            isCompleted: false,
            status: "todo",
          };

          dispatch(
            addTaskToWorkspaceTodo({
              workspaceSlug,
              task: newTask,
              rawFiles: data.attachments, // Passes files to Middleware for upload
            })
          );

          closeAssignModal();
        }}
      />

      <AddWorkspaceModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAddWorkspace}
      />
    </div>
  );
};

export default Workspaces;
