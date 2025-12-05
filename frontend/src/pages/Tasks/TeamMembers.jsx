// src/pages/TeamMembers.jsx
import React, { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import DepartmentMembers from "../../component/Tasks/TeamMembers/DepartmentMembers";
import { useSelector, useDispatch } from "react-redux";
import { selectAllUsers } from "../../store/slices/Users.slice";
import { selectCurrentUser } from "../../store/slices/Auth.slice";

// ✅ NEW: get workspaces from redux list
import {
  selectWorkspaces,
  addMembersToWorkspace,
} from "../../store/slices/Workspaces.slice";

const TeamMembers = () => {
  const users = useSelector(selectAllUsers);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  // ✅ CHANGED: Workspaces source from redux list
  const workspaces = useSelector(selectWorkspaces) || [];

  const [searchTerm, setSearchTerm] = useState("");

  // ✅ selected workspace (id)
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");

  // ✅ selected members for adding
  const [selectedMemberIds, setSelectedMemberIds] = useState([]); // string[]

  const handleChange = (e) => setSearchTerm(e.target.value);

  const handleWorkspaceSelect = (e) => {
    const id = e.target.value;
    setSelectedWorkspaceId(id);
    setSelectedMemberIds([]); // reset selections when workspace changes
  };

  const toggleMemberSelect = (userId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const clearSelections = () => setSelectedMemberIds([]);

  // ✅ on click add members to workspace
  const handleAddToWorkspace = async () => {
    if (!selectedWorkspaceId || selectedMemberIds.length === 0) return;

    const workspace = workspaces.find(
      (w) => String(w.id) === String(selectedWorkspaceId)
    );

    // ✅ build members with same fields as workspace members
    const membersToAdd = users
      .filter((u) => selectedMemberIds.includes(u._id))
      .map((u) => ({
        _id: u._id,
        username: u.username || u.name || "Unknown",
        email: u.email || "",
        role: u.role || "user",
        department: u.department || u.team || "",
      }));

    dispatch(
      addMembersToWorkspace({
        workspaceId: selectedWorkspaceId,
        membersToAdd,
      })
    );

    console.log(
      "Adding members:",
      selectedMemberIds,
      "to workspace:",
      workspace
    );

    clearSelections();
  };

  const canAdd = selectedWorkspaceId && selectedMemberIds.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-6">
      <div className="relative flex min-h-screen w-full flex-col">
        <div className="flex flex-1">
          {/* Main Content */}
          <main className="flex-1">
            <div className="mx-auto max-w-7xl">
              {/* Page Heading & Toolbar */}
              <header className="mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <h1 className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white">
                    Team Members
                  </h1>

                  {/* ✅ Workspace dropdown + action */}
                  <div className="flex items-center gap-3">
                    <select
                      className="select select-bordered select-sm min-w-64 bg-white dark:bg-gray-900 truncate"
                      value={selectedWorkspaceId}
                      onChange={handleWorkspaceSelect}
                    >
                      <option value="" disabled>
                        Select Workspace
                      </option>
                      {workspaces.map((ws) => (
                        <option
                          key={ws.id}
                          value={ws.id}
                          className="capitalize"
                        >
                          {ws.title}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleAddToWorkspace}
                      disabled={!canAdd}
                      className={`btn btn-primary btn-sm flex items-center gap-2
                        ${!canAdd ? "btn-disabled opacity-60" : ""}`}
                      title={
                        !selectedWorkspaceId
                          ? "Select a workspace first"
                          : selectedMemberIds.length === 0
                          ? "Select members to add"
                          : "Add selected members"
                      }
                    >
                      Add to workspace
                      {selectedMemberIds.length > 0 && (
                        <span className="bg-indigo-900 px-2 py-1 rounded-full ml-1">
                          {selectedMemberIds.length}
                        </span>
                      )}
                    </button>

                    {/* Optional clear */}
                    {selectedMemberIds.length > 0 && (
                      <button
                        onClick={clearSelections}
                        className="btn btn-ghost btn-sm"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Search */}
                <div>
                  <label className="flex flex-col min-w-40 w-full max-w-md">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary">
                      <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center pl-4">
                        <Search size={18} />
                      </div>
                      <input
                        className="form-input flex w-full min-w-0 flex-1 text-gray-900 dark:text-gray-100 focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 py-2 pl-2 text-base"
                        placeholder="Search by name or email"
                        value={searchTerm}
                        onChange={handleChange}
                      />
                    </div>
                  </label>
                </div>
              </header>

              {/* Department-wise members */}
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
    </div>
  );
};

export default TeamMembers;
