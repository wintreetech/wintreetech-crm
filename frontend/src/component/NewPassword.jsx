import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetPassword } from "../store/slices/Auth.slice";

const NewPassword = () => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [success, setSuccess] = useState(false);
	const { token } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		try {
			const res = await dispatch(resetPassword({ token, password })).unwrap();

			toast.success(res.message || "Password updated");
			setSuccess(true);

			setTimeout(() => {
				navigate("/login");
			}, 2000);
		} catch (err) {
			toast.error(err);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 dark:bg-gray-900">
			<div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 dark:bg-gray-800">
				{/* Left Section */}
				<div className="p-10 md:p-14 flex flex-col justify-center gap-6">
					<div className="text-center">
						<h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-200">
							Set New Password
						</h1>
						<p className="mt-3 text-gray-600 dark:text-gray-400">
							Choose a strong password to secure your account
						</p>
					</div>

					{success ? (
						<div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 text-center">
							Your password has been updated successfully. You can now log in
							with your new password.
						</div>
					) : (
						<form onSubmit={handleSubmit} className="flex flex-col gap-5">
							{/* New Password */}
							<div>
								<label className="block text-gray-700 mb-2 dark:text-gray-300">
									New Password
								</label>
								<div className="relative">
									<input
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										placeholder="Enter new password"
										className="w-full px-4 py-3 rounded-lg border border-gray-300
                    focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                    dark:bg-gray-900 dark:border-gray-700 dark:text-white"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-3 text-gray-500 dark:text-gray-400"
									>
										{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
							</div>

							{/* Confirm Password */}
							<div>
								<label className="block text-gray-700 mb-2 dark:text-gray-300">
									Confirm Password
								</label>
								<div className="relative">
									<input
										type={showConfirm ? "text" : "password"}
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
										placeholder="Re-enter new password"
										className="w-full px-4 py-3 rounded-lg border border-gray-300
                    focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                    dark:bg-gray-900 dark:border-gray-700 dark:text-white"
									/>
									<button
										type="button"
										onClick={() => setShowConfirm(!showConfirm)}
										className="absolute right-3 top-3 text-gray-500 dark:text-gray-400"
									>
										{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
							</div>

							<button
								type="submit"
								className="w-full bg-indigo-600 text-white py-3 rounded-lg
                font-semibold hover:bg-indigo-700 transition"
							>
								Update Password
							</button>
						</form>
					)}
				</div>

				{/* Right Illustration */}
				<div
					className="hidden md:flex items-center justify-center 
          bg-gradient-to-br from-indigo-50 to-white 
          dark:from-gray-900 dark:to-gray-800 
          text-gray-800 dark:text-gray-500 p-6"
				>
					<div className="max-w-xs text-center">
						<p className="text-gray-600 dark:text-gray-400">
							Your security matters. Make sure your password is strong and
							unique.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NewPassword;
