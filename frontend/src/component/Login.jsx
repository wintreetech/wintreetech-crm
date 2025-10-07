import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

const Login = () => {
	const [loginData, setLoginData] = useState({ email: "", password: "" });
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setLoginData({ ...loginData, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const res = await api.post("/auth/login", loginData);
			const user = res.data.user;

			localStorage.setItem("currentUser", JSON.stringify(user));
			toast.success(res.data.message || "Login successful");

			if (user.role === "superadmin") {
				navigate("/dashboard");
			} else if (user.role === "admin") {
				navigate(`/${user.department.toLowerCase()}`);
			} else {
				navigate(`/${user.department.toLowerCase()}`);
			}
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.message || "Login failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
			<div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
				{/* Left: Login Form */}
				<div className="p-10 md:p-14 flex flex-col justify-center gap-6">
					<div className=" text-center">
						<h1 className="text-3xl sm:text-4xl text-center font-extrabold text-gray-900 leading-tight">
							Welcome to{" "}
							<span className="text-indigo-600">Wintreetech CRM</span>
						</h1>
						<p className="mt-3 text-gray-600 max-w-xl">
							Sign in quickly and securely — your workflow, uninterrupted.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="flex flex-col gap-5">
						{/* Email */}
						<div>
							<label className="block text-gray-700 mb-2" htmlFor="email">
								Email
							</label>
							<input
								type="email"
								name="email"
								id="email"
								value={loginData.email}
								onChange={handleChange}
								placeholder="example@mail.com"
								required
								className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
							/>
						</div>

						{/* Password */}
						<div>
							<label className="block text-gray-700 mb-2" htmlFor="password">
								Password
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									name="password"
									id="password"
									value={loginData.password}
									onChange={handleChange}
									placeholder="Enter your password"
									required
									className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
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

						{/* Submit */}
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
						>
							{loading ? "Logging in..." : "Sign In"}
						</button>
					</form>
				</div>

				{/* Right: Illustration */}
				<div className="hidden md:flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-6">
					<div className="max-w-xs text-center">
						<svg
							viewBox="0 0 200 200"
							className="mx-auto w-56 h-56"
							xmlns="http://www.w3.org/2000/svg"
							role="img"
							aria-labelledby="title desc"
						>
							<title id="title">Team collaboration illustration</title>
							<desc id="desc">
								Abstract illustration with shapes and a friendly character.
							</desc>
							<rect
								x="0"
								y="0"
								width="200"
								height="200"
								rx="20"
								fill="transparent"
							/>
							<circle cx="60" cy="70" r="28" fill="#EEF2FF" />
							<circle cx="120" cy="80" r="20" fill="#C7D2FE" />
							<rect
								x="40"
								y="110"
								width="120"
								height="40"
								rx="8"
								fill="#E0E7FF"
							/>
							<g transform="translate(60,70)">
								<circle cx="0" cy="0" r="10" fill="#4F46E5" />
								<rect
									x="-18"
									y="20"
									width="36"
									height="8"
									rx="4"
									fill="#3730A3"
									opacity="0.9"
								/>
							</g>
						</svg>

						<p className="mt-4 text-gray-600">
							A calm, focused place to manage your workflow.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
