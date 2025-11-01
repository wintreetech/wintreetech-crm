import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/slices/Auth.slice";
import {
  selectUsersError,
  selectUsersLoading,
} from "../store/slices/Users.slice";

const RegisterModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = "create",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [allowPasswordEdit, setAllowPasswordEdit] = useState(false);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);
  const currentUser = useSelector(selectCurrentUser);

  // Role based permission
  const hasPermission =
    currentUser?.role === "admin" || currentUser?.role === "superadmin";

  // Base form state
  const emptyForm = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    department: "",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      setForm({ ...emptyForm, ...initialData });
    } else {
      setForm({
        ...emptyForm,
        department:
          currentUser?.role === "admin" ? currentUser?.department || "" : "",
      });
    }
  }, [isOpen, mode, initialData, currentUser?.role, currentUser?.department]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic password validation only for "create"
    if (mode === "create" && form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog open={isOpen} className="modal modal-bottom sm:modal-middle">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          className="cursor-pointer absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          <X />
        </button>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          {mode === "edit" ? "Edit User" : "Create an Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="username">
              Full Name
            </label>
            <input
              type="text"
              name="username"
              required
              value={form.username}
              onChange={handleChange}
              placeholder="Eg: Jhon Doe"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email ID
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Role + Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role field for admin/superadmin */}
            {hasPermission && (
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="role">
                  Select Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="select w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Pick a role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  {currentUser?.role === "superadmin" && (
                    <option value="superadmin">Superadmin</option>
                  )}
                </select>
              </div>
            )}

            {/* Department field */}
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="department">
                Select Department
              </label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                required
                className="select w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pick a Department</option>

                {currentUser?.role === "superadmin" && (
                  <>
                    <option value="finance">Finance</option>
                    <option value="sales">Sales</option>
                    <option value="recon">Recon</option>
                    <option value="support">Support</option>
                    <option value="management">Management</option>
                  </>
                )}

                {currentUser?.role === "admin" && (
                  <option value={currentUser.department}>
                    {currentUser.department.charAt(0).toUpperCase() +
                      currentUser.department.slice(1)}
                  </option>
                )}
              </select>
            </div>
          </div>

          {/* Password + Confirm Password fields only for create*/}
          {mode === "create" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>
          )}

          {/* Error / Success */}
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn w-full py-3 rounded-xl font-semibold disabled:opacity-50 shadow-lg"
          >
            {loading
              ? mode === "edit"
                ? "Updating..."
                : "Creating..."
              : mode === "edit"
              ? "Update User"
              : "Register"}
          </button>
        </form>
      </div>
    </dialog>
  );
};

export default RegisterModal;
