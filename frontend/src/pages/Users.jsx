import React, { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import RegisterModal from "../component/RegisterModal";
import useAuthStore from "../store/AuthStore";
import api from "../api";

function User() {
	const { allUsers, setAllUsers } = useAuthStore();

	const [currentPage, setCurrentPage] = useState(1);
	const usersPerPage = 9;
	const [registerModalOpen, setRegisterModalOpen] = useState(false);

	// Pagination
	const totalPages = Math.ceil(allUsers.length / usersPerPage);
	const indexOfLastUser = currentPage * usersPerPage;
	const indexOfFirstUser = indexOfLastUser - usersPerPage;
	const currentUsers = allUsers.slice(indexOfFirstUser, indexOfLastUser);
	const [loading, setLoading] = useState(false);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const res = await api.get("/auth/alluser");
			if (res.data.success) {
				setAllUsers(res.data.data.reverse());
			}
		} catch (err) {
			toast.error("Failed to fetch users");
		} finally {
			setLoading(false);
		}
	};

	// ✅ Fetch users when component mounts
	useEffect(() => {
		fetchUsers();
	}, []);

	// ✅ Called when RegisterModal form submits
	const handleUserSubmit = async (formData) => {
		try {
			const res = await api.post("/auth/register", formData);
			toast.success(res.data?.message);
			await fetchUsers();
			setRegisterModalOpen(false);
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to register user");
		}
	};

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

			{/* Search */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
				<div className="relative w-full md:w-1/2">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
					<input
						type="text"
						placeholder="Search users by name or email..."
						className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
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
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan={5} className="text-center py-6">
									Loading users...
								</td>
							</tr>
						) : currentUsers.length > 0 ? (
							currentUsers.map((user) => (
								<tr key={user._id} className="border-t hover:bg-gray-50">
									<td className="py-3 px-4">{user.username}</td>
									<td className="py-3 px-4">{user.email}</td>
									<td className="py-3 px-4 capitalize">{user.role}</td>
									<td className="py-3 px-4">{user.department || "-"}</td>
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
