import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";

const RegisterModal = ({ isOpen, onClose, onSubmit }) => {
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [registerFormData, setRegisterFormData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
		role: "",
		department: "",
	});

	const currentUser = JSON.parse(localStorage.getItem("currentUser"));

	useEffect(() => {
		// Auto-fill department for admin only if it's not already set
		if (currentUser?.role === "admin" && !registerFormData.department) {
			setRegisterFormData((prev) => ({
				...prev,
				department: currentUser.department || "",
			}));
		}
	}, [currentUser, registerFormData.department]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setRegisterFormData({ ...registerFormData, [name]: value });
	};

	const clearData = () => {
		setRegisterFormData({
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
			role: "",
			department: currentUser?.role === "admin" ? currentUser.department : "",
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (registerFormData.password !== registerFormData.confirmPassword) {
			toast.error("Passwords do not match.");
			return;
		}

		const { confirmPassword, ...rest } = registerFormData;

		setLoading(true);
		try {
			if (onSubmit) {
				await onSubmit(rest);
			}

			// Auto-close after short delay
			setTimeout(() => {
				onClose();
				clearData();
			}, 1500);
		} catch (err) {
			setError(err.message || "Something went wrong during registration.");
		} finally {
			setLoading(false);
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
					×
				</button>

				<h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
					Create an Account
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
							value={registerFormData.username}
							onChange={handleChange}
							placeholder="Aditya Ghule"
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
							value={registerFormData.email}
							onChange={handleChange}
							placeholder="example@mail.com"
							className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
						/>
					</div>

					{/* Role + Department */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Role field for admin/superadmin */}
						{(currentUser?.role === "superadmin" ||
							currentUser?.role === "admin") && (
							<div>
								<label className="block text-gray-700 mb-2" htmlFor="role">
									Select Role
								</label>
								<select
									name="role"
									value={registerFormData.role}
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
								value={registerFormData.department}
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

					{/* Password + Confirm Password */}
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
									value={registerFormData.password}
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
								value={registerFormData.confirmPassword}
								onChange={handleChange}
								placeholder="Re-enter your password"
								className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
							/>
						</div>
					</div>

					{/* Error / Success */}
					{error && <p className="text-red-600 text-sm text-center">{error}</p>}

					{/* Submit */}
					<button
						type="submit"
						disabled={loading}
						className="btn-primary btn w-full py-3 rounded-xl font-semibold disabled:opacity-50 shadow-lg"
					>
						{loading ? "Creating account..." : "Register"}
					</button>
				</form>
			</div>
		</dialog>
	);
};

export default RegisterModal;
