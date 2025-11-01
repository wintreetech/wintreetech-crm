import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pen } from "lucide-react";
import toast from "react-hot-toast";
import RegisterModal from "../component/RegisterModal";
import api from "../api";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser } from "../store/slices/Auth.slice";
import {
  fetchUsers,
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

  // Fetch all users on mount
  useEffect(() => {
    dispatch(fetchUsers())
      .unwrap()
      .catch((err) => {
        toast.error(err || "Failed to fetch users");
      });
  }, [dispatch]);

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
          (u.email && u.email.toLowerCase().includes(q))
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
      console.log("form data for the new user", formData);
      const { message } = await dispatch(registerUser(formData)).unwrap();
      toast.success(message || "User registered");
      setRegisterModalOpen(false);
    } catch (err) {
      toast.error(err || "Failed to register user");
    }
  };

  // Edit and update existing user
  const handleUpdate = async (formData) => {
    try {
      if (!formData?._id) {
        toast.error("Missing user id");
        return;
      }

      const { message } = await dispatch(
        updateUser({ id: formData._id, data: formData })
      ).unwrap();

      toast.success(message || "User updated");
      setEditOpen(false);
      setEditingUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Keep page in range if filtering shrinks the list
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg md:text-2xl font-semibold text-gray-800">
          Users Management
        </h1>
        <button
          onClick={() => setRegisterModalOpen(true)}
          className="btn-primary btn"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add User</span>
        </button>
      </div>

      {/* Register Modal */}
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSubmit={handleUserSubmit}
      />

      {/* Edit User Modal (reuse RegisterModal) */}
      {editOpen && editingUser && (
        <RegisterModal
          isOpen={editOpen}
          onClose={() => {
            setEditOpen(false);
            setEditingUser(null);
          }}
          onSubmit={handleUpdate}
          initialData={editingUser} // <-- prefill
          mode="edit" // <-- let modal switch labels/behavior
        />
      )}

      {/* Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search users by name or email..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="font-bold">
          {allUsers.length} {allUsers.length === 1 ? "User" : "Users"}{" "}
        </p>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600">
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
                <td colSpan={5} className="text-center py-6">
                  Loading users...
                </td>
              </tr> //.filter((value) => value.department === user.department)
            ) : currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4 capitalize">{user.username}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4 capitalize">
                    <span
                      className={`px-2 capitalize rounded-xl text-black ${
                        {
                          admin: "bg-indigo-100 text-indigo-600",
                          superadmin: "bg-yellow-100 text-yellow-600",
                          user: "bg-emerald-100 text-emerald-600",
                        }[user.role?.toLowerCase()] || "bg-gray-400"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 capitalize rounded-xl text-black ${
                        {
                          finance: "bg-blue-100 text-blue-600",
                          sales: "bg-green-100 text-green-600",
                          recon: "bg-purple-100 text-purple-600",
                          support: "bg-orange-100 text-orange-600",
                          management: "bg-pink-100 text-pink-600",
                        }[user.department?.toLowerCase()] || "bg-gray-400"
                      }`}
                    >
                      {user.department || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
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
                  {/* Edit */}
                  <td className="py-3 px-4 flex justify-center">
                    {hasPermission && (
                      <button
                        onClick={() => {
                          setEditingUser(user); // prefill from store
                          setEditOpen(true);
                        }}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 active:scale-95 transition-all duration-150"
                        title="Edit User"
                        aria-label="Edit User"
                      >
                        <Pen className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No users found
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
          className="px-4 py-2 border rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 border rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default User;
