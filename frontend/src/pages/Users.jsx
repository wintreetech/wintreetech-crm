import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pen, Trash } from "lucide-react";
import toast from "react-hot-toast";
import RegisterModal from "../component/RegisterModal";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser } from "../store/slices/Auth.slice";
import {
  deleteUser,
  registerUser,
  selectAllUsers,
  selectUsersLoading,
  updateUser,
} from "../store/slices/Users.slice";

function User() {
  const dispatch = useDispatch();

  // Redux states
  const currentUser = useSelector(selectCurrentUser);
  const allUsers = useSelector(selectAllUsers);
  const loading = useSelector(selectUsersLoading);

  // Role based permission
  const hasPermission =
    currentUser?.role === "admin" || currentUser?.role === "superadmin";

  // Local UI state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 9;
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  // for edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Filter by role/department and search
  const visibleUsers = useMemo(() => {
    let list = allUsers;

    // Admins only see their department
    if (currentUser?.role === "admin" && currentUser?.department) {
      list = list.filter((u) => u.department === currentUser.department);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          (u.username && u.username.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [allUsers, currentUser, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(visibleUsers.length / usersPerPage));
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = visibleUsers.slice(indexOfFirstUser, indexOfLastUser);

  // ✅ Called when RegisterModal form submits
  const handleUserSubmit = async (formData) => {
    try {
      const { message } = await dispatch(registerUser(formData)).unwrap();
      toast.success(message || "User registered");
      setRegisterModalOpen(false);
    } catch (err) {
      toast.error(err || "Failed to register user");
    }
  };

  // Edit and update an existing user
  const handleUpdate = async (formData) => {
    try {
      if (!formData?._id) {
        toast.error("Missing user id");
        return;
      }

      const { message } = await dispatch(
        updateUser({ id: formData._id, data: formData }),
      ).unwrap();

      toast.success(message || "User updated");
      setEditOpen(false);
      setEditingUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  //Delete an existing user
  const handleDelete = async (user) => {
    if (currentUser?.id === user._id) {
      toast.error("You cannot delete your own account.");
      return;
    }

    const ok = window.confirm(`Delete user "${user.username}"?`);
    if (!ok) return;

    try {
      const { message } = await dispatch(deleteUser(user._id)).unwrap();
      toast.success(message || "User deleted successfully");
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : err?.message || "Delete failed",
      );
    }
  };

  // Keep page in range if filtering shrinks the list
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <div className="p-4 bg-gray-50 min-h-screen dark:bg-gray-800 dark:text-gray-100">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white">
          Users Management
        </h1>
        <button
          onClick={() => setRegisterModalOpen(true)}
          className="btn-primary btn w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add User</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Register Modal */}
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSubmit={handleUserSubmit}
      />

      {/* Edit User Modal */}
      {editOpen && editingUser && (
        <RegisterModal
          isOpen={editOpen}
          onClose={() => {
            setEditOpen(false);
            setEditingUser(null);
          }}
          onSubmit={handleUpdate}
          initialData={editingUser}
          mode="edit"
        />
      )}

      <div className="bg-white rounded-xl shadow-sm p-4 dark:bg-gray-900">
        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search users by name or email..."
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg w-full 
                   bg-white dark:bg-gray-900 
                   text-gray-900 dark:text-gray-100 
                   focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <p className="font-bold text-sm sm:text-base text-gray-700 dark:text-gray-200 md:text-right">
            {allUsers.length} {allUsers.length === 1 ? "User" : "Users"}
          </p>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="py-2 px-4">Full Name</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Role</th>
                <th className="py-2 px-4">Department</th>
                <th className="py-2 px-4">Created At</th>
                {hasPermission && <th className="py-2 px-4">Actions</th>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6">
                    Loading users...
                  </td>
                </tr>
              ) : currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="bg-white border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900"
                  >
                    <td className="py-3 px-4 capitalize whitespace-nowrap">
                      {user.username}
                    </td>
                    <td className="py-3 px-4 break-all max-w-[260px]">
                      {user.email}
                    </td>
                    <td className="py-3 px-4 capitalize whitespace-nowrap">
                      <span
                        className={`px-2 capitalize rounded-xl inline-block ${
                          {
                            admin:
                              "bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-100",
                            superadmin:
                              "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100",
                            user: "bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-100",
                          }[user.role?.toLowerCase()] || "bg-gray-400"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 capitalize rounded-xl inline-block ${
                          {
                            finance:
                              "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100",
                            sales:
                              "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100",
                            recon:
                              "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-100",
                            support:
                              "bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-100",
                            management:
                              "bg-pink-100 text-pink-700 dark:bg-pink-800 dark:text-pink-100",
                            development:
                              "bg-teal-100 text-teal-700 dark:bg-teal-800 dark:text-teal-100",
                            settlement:
                              "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-100",
                          }[user.department?.toLowerCase()] || "bg-gray-400"
                        }`}
                      >
                        {user.department || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      {new Date(user.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      {hasPermission && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setEditOpen(true);
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md 
                                 bg-gray-100 text-gray-700 
                                 hover:bg-gray-200 hover:text-gray-900 
                                 dark:bg-gray-800 dark:text-gray-200 
                                 dark:hover:bg-gray-700 dark:hover:text-white
                                 active:scale-95 transition-all duration-150 cursor-pointer"
                            title="Edit User"
                            aria-label="Edit User"
                          >
                            <Pen className="w-4 h-4" />
                          </button>

                          {currentUser.id !== user._id && (
                            <button
                              onClick={() => handleDelete(user)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md 
                                   bg-red-100 text-red-400 hover:bg-red-200 hover:text-red-600 
                                   dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 dark:hover:text-red-100 
                                   active:scale-95 transition-all duration-150 cursor-pointer"
                              title="Delete User"
                              aria-label="Delete User"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-base font-medium">
                        No users found
                      </span>
                      <p className="text-sm opacity-70">
                        {search && "Try adjusting your search"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 w-full sm:w-auto"
          >
            Previous
          </button>
          <span className="text-sm order-first sm:order-none">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 w-full sm:w-auto"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default User;
