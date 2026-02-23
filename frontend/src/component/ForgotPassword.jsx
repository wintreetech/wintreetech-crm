import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const ForgotPassword = () => {
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState("idle");
	// idle | success | error

	const handleSubmit = (e) => {
		e.preventDefault();

		// 🔹 UI-only logic
		if (email === "example@mail.com") {
			setStatus("success");
			toast.success("Reset link sent to your email");
		} else {
			setStatus("error");
			toast.error("Email not found");
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 dark:bg-gray-900">
			<div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 dark:bg-gray-800">
				{/* Left */}
				<div className="p-10 md:p-14 flex flex-col justify-center gap-6">
					<div className="text-center">
						<h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-200">
							Forgot Password
						</h1>
						<p className="mt-3 text-gray-600 dark:text-gray-400">
							We’ll send you a link to reset your password
						</p>
					</div>

					{status === "success" ? (
						<div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 text-center">
							Reset link has been sent to your email.
						</div>
					) : (
						<form onSubmit={handleSubmit} className="flex flex-col gap-5">
							<div>
								<label className="block text-gray-700 mb-2 dark:text-gray-300">
									Email
								</label>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="example@mail.com"
									required
									className="w-full px-4 py-3 rounded-lg border border-gray-300
                  focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                  dark:bg-gray-900 dark:border-gray-700 dark:text-white"
								/>
							</div>

							{status === "error" && (
								<p className="text-sm text-red-600">
									No account found with this email.
								</p>
							)}

							<button
								type="submit"
								className="w-full bg-indigo-600 text-white py-3 rounded-lg
                font-semibold hover:bg-indigo-700 transition"
							>
								Send Reset Link
							</button>
						</form>
					)}

					<Link
						to="/login"
						className="text-indigo-600 text-sm font-medium hover:underline text-center"
					>
						← Back to Login
					</Link>
				</div>

				{/* Right (same illustration style) */}
				<div
					className="hidden md:flex items-center justify-center 
          bg-gradient-to-br from-indigo-50 to-white 
          dark:from-gray-900 dark:to-gray-800 
          p-6"
				>
					<p className="text-gray-600 text-center max-w-xs">
						Securely recover access to your account in just a few steps.
					</p>
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
