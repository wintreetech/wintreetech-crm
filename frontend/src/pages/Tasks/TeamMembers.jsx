import React, { useMemo, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";

// Components
import DepartmentMembers from "../../component/Tasks/TeamMembers/DepartmentMembers";

// State
import { selectAllUsers } from "../../store/slices/Users.slice";
import { selectCurrentUser } from "../../store/slices/Auth.slice";
import {
  selectWorkspaces,
  updateMembersInWorkspace,
} from "../../store/slices/Workspaces.slice";
import toast from "react-hot-toast";

const TeamMembers = () => {
  const dispatch = useDispatch();

  // Redux Selectors
  const users = useSelector(selectAllUsers);
  const currentUser = useSelector(selectCurrentUser);
  const workspaces = useSelector(selectWorkspaces) || [];

  // Local State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  // Sync selected members when workspace selection changes
  useEffect(() => {
    if (!selectedWorkspaceId) {
      setSelectedMemberIds([]);
      return;
    }

    const ws = workspaces.find(
      (w) => String(w.id) === String(selectedWorkspaceId)
    );
    const existingIds = Array.isArray(ws?.members)
      ? ws.members.map((m) => String(m?.id)).filter(Boolean)
      : [];

    setSelectedMemberIds(existingIds);
  }, [selectedWorkspaceId, workspaces]);

  // Derived State
  const canAdd = selectedWorkspaceId && selectedMemberIds.length > 0;

  const actionLabel = useMemo(() => {
    if (!selectedWorkspaceId) return "Add to workspace";
    const ws = workspaces.find(
      (w) => String(w.id) === String(selectedWorkspaceId)
    );
    return ws?.members?.length > 0 ? "Update members" : "Add to workspace";
  }, [selectedWorkspaceId, workspaces]);

  // Handlers
  const toggleMemberSelect = (userId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddToWorkspace = async () => {
    if (!selectedWorkspaceId) return;

    const uniqueSelectedIds = [...new Set(selectedMemberIds.map(String))];

    const membersToAdd = users
      .filter((u) => uniqueSelectedIds.includes(String(u._id)))
      .map((u) => ({
        id: String(u._id),
        username: u.username || "Unknown",
        email: u.email || "",
        role: u.role || "user",
        department: u.department || "",
      }));
    try {
      await dispatch(
        updateMembersInWorkspace({
          workspaceId: selectedWorkspaceId,
          membersToAdd: membersToAdd,
        })
      ).unwrap();

      toast.success("Members added successfully");

      setSelectedWorkspaceId("");
      setSelectedMemberIds([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add members");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-4 sm:p-6">
      <div className="relative flex min-h-screen w-full flex-col">
        <main className="flex-1">
          <div className="mx-auto max-w-7xl">
            <header className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white">
                  Team Members
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                  {/* Workspace Selection */}
                  <select
                    className="select select-bordered select-sm w-full sm:min-w-64 bg-white dark:bg-gray-900"
                    value={selectedWorkspaceId}
                    onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                  >
                    <option value="" disabled>
                      Select Workspace
                    </option>
                    {workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id} className="capitalize">
                        {ws.title}
                      </option>
                    ))}
                  </select>

                  {/* Action Button */}
                  <button
                    onClick={handleAddToWorkspace}
                    disabled={!canAdd}
                    className={`btn btn-primary btn-sm flex items-center justify-center gap-2 w-full sm:w-auto ${
                      !canAdd ? "opacity-60" : ""
                    }`}
                  >
                    {actionLabel}
                    {selectedMemberIds.length > 0 && (
                      <span className="bg-indigo-900 px-2 py-0.5 rounded-full text-xs">
                        {selectedMemberIds.length}
                      </span>
                    )}
                  </button>

                  {selectedMemberIds.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedMemberIds([]);
                        setSelectedWorkspaceId("");
                      }}
                      className="btn btn-ghost btn-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Search Bar */}
              <div className="max-w-md">
                <div className="flex items-center rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary px-4 h-10">
                  <Search size={18} className="text-gray-500" />
                  <input
                    className="form-input flex-1 bg-transparent border-none focus:outline-0  focus:ring-0 text-sm px-2 text-gray-900 dark:text-gray-100"
                    placeholder="Search by name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </header>

            <DepartmentMembers
              users={users}
              searchTerm={searchTerm}
              selectable={!!selectedWorkspaceId}
              selectedMemberIds={selectedMemberIds}
              onToggleMember={toggleMemberSelect}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeamMembers;
