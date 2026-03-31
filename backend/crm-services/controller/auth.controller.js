import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Auth from "../models/auth.model.js"; // Your Auth model
import dotenv from "dotenv";
import { publishUserSync } from "../utils/rabbit.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { sendEmail } from "../utils/sendEmail.js";
dotenv.config();

// Register user
const register = async (req, res) => {
	try {
		const { username, email, password, role, department } = req.body;

		if (!username || !email || !password || !role || !department) {
			return res.status(400).json({ message: "All fields are required" });
		}

		// Check if user already exists
		const existingUser = await Auth.findOne({ email });
		if (existingUser) {
			return res.status(409).json({ message: "Email already registered" });
		}

		// Hash the password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create new user
		const newUser = new Auth({
			username,
			email,
			password: hashedPassword,
			role,
			department,
		});

		await newUser.save();

		//Trigger sync to Tasks Service
		publishUserSync(newUser, "CREATE");

		return res.status(201).json({
			message: `Registration successful! You can now give credentials to ${username} for log in`,
			data: {
				_id: newUser._id,
				username,
				email,
				role,
				department,
				createdAt: newUser.createdAt,
			},
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Server error" });
	}
};

// Login user
const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}

		const user = await Auth.findOne({ email });
		if (!user)
			return res.status(401).json({ message: "Invalid email or password" });

		// Compare password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(401).json({ message: "Invalid email or password" });

		// Create JWT token
		const token = jwt.sign(
			{ id: user._id, email: user.email, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "7d" },
		);

		const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

		// Set httpOnly cookie
		res.cookie("auth_token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "prod", // requires HTTPS in prod
			sameSite: "Lax",
			maxAge: sevenDaysInMs, // 7 day
			path: "/", // send for all routes
		});

		return res.status(200).json({
			message: "Login successful",
			token,
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
				role: user.role,
				department: user.department,
			},
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Server error" });
	}
};

//  Logout: clear the cookie
const logout = async (_req, res) => {
	(res.clearCookie("auth_token"), { path: "/" });
	return res.status(200).json({ message: "Logged out" });
};

// Update existing user
const updateUser = async (req, res) => {
	try {
		const { id } = req.params;
		const { username, email, role, department, password } = req.body;

		// Find target user
		const user = await Auth.findById(id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// If email is changing, ensure it's unique
		if (email && email !== user.email) {
			const emailTaken = await Auth.findOne({ email });
			if (emailTaken && String(emailTaken._id) !== String(id)) {
				return res.status(409).json({ message: "Email already registered" });
			}
			user.email = email;
		}

		// Update other scalar fields if provided
		if (typeof username === "string" && username.trim())
			user.username = username.trim();
		if (typeof role === "string" && role.trim()) user.role = role.trim();
		if (typeof department === "string" && department.trim())
			user.department = department.trim();

		// If password provided, re-hash
		if (typeof password === "string" && password.length > 0) {
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);
		}

		// Save and return sanitized user
		await user.save();

		// Trigger sync to Tasks Service
		publishUserSync(user, "UPDATE");

		return res.status(200).json({
			message: "User updated successfully",
			data: {
				id: user._id,
				username: user.username,
				email: user.email,
				role: user.role,
				department: user.department,
			},
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Server error" });
	}
};

// Delete an existing user
const deleteUser = async (req, res) => {
	try {
		const { id } = req.params;

		if (!id) {
			return res.status(400).json({ message: "User id is required" });
		}

		const deleted = await Auth.findByIdAndDelete(id);

		if (!deleted) {
			return res.status(400).json({ message: "User not found" });
		}

		// Trigger sync to Tasks Service
		// We pass an object with just the _id so the Task service knows what to remove
		publishUserSync({ _id: id }, "DELETE");

		return res.status(200).json({
			message: `User "${deleted.username}" deleted successfully`,
			id: deleted._id,
		});
	} catch (err) {
		// Invalid ObjectId or other DB errors
		if (err.name === "CastError") {
			return res.status(400).json({ message: "Invalid user id" });
		}
		console.error("Delete user error:", err);
		return res.status(500).json({ message: "Server error" });
	}
};

// Get all users
const AllUser = async (req, res) => {
	try {
		const users = await Auth.find().select("-password");
		return res.status(200).json({
			success: true,
			message: "Users fetched successfully",
			data: users,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch users",
			error: error.message,
		});
	}
};

export { register, login, logout, AllUser, updateUser, deleteUser };

//forgotPassword
export const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		console.log("Forgot password API hit", req.body);

		const user = await Auth.findOne({ email });

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Generate token
		const resetToken = crypto.randomBytes(32).toString("hex");
		user.resetPasswordToken = resetToken;
		user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

		await user.save();

		const clientURL =
			process.env.ENV === "prod"
				? process.env.CLIENT_URL_PROD
				: process.env.CLIENT_URL;

		const resetURL = `${clientURL}/reset-password/${resetToken}`;
		await sendEmail(
			user.email,
			"Password Reset Request",
			`
	
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />

<div style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Poppins',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08);font-family:'Poppins',Arial,sans-serif;">
          
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb 0%,#4f46e5 100%);padding:18px 40px;text-align:right;">
              <span style="font-size:12px;line-height:18px;color:rgba(255,255,255,0.75);letter-spacing:0.08em;text-transform:uppercase;font-family:'Poppins',Arial,sans-serif;">
                Secure Account Notification
              </span>
            </td>
          </tr>

          <tr>
            <td style="background:linear-gradient(135deg,#2563eb 0%,#4f46e5 100%);padding:0 50px 60px;text-align:center;">
              <div style="margin-bottom:42px;">
                <img src="https://wintreetech.com/wp-content/uploads/2025/06/logo-wintreetech-white-1-1.png" alt="Logo" style="max-width:140px;height:auto;display:inline-block;" />
              </div>

              <div style="width:90px;height:90px;margin:0 auto 28px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.16);border-radius:24px;text-align:center;line-height:90px;">
                <span style="font-size:42px;">🔐</span>
              </div>

              <div style="font-size:14px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.78);margin-bottom:14px;font-family:'Poppins',Arial,sans-serif;">
                Password Reset Request
              </div>

              <h1 style="margin:0;font-size:40px;line-height:48px;font-weight:700;color:#ffffff;font-family:'Poppins',Arial,sans-serif;">
                Reset Your Password
              </h1>

              <p style="max-width:420px;margin:20px auto 0;font-size:16px;line-height:28px;color:rgba(255,255,255,0.82);font-family:'Poppins',Arial,sans-serif;">
                We received a request to reset the password for your account. Click the button below to create a new password securely.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:50px 50px 20px;background:#ffffff;">
              <p style="margin:0 0 18px;font-size:18px;line-height:30px;color:#111827;font-weight:600;font-family:'Poppins',Arial,sans-serif;">
                Hello, ${user.username}
              </p>

              <p style="margin:0 0 30px;font-size:16px;line-height:30px;color:#4b5563;font-family:'Poppins',Arial,sans-serif;">
                For your security, this password reset link will expire in <strong style="color:#111827;">15 minutes</strong>. If you did not make this request, you can safely ignore this email.
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto 34px;">
                <tr>
                  <td align="center" style="border-radius:14px;background:linear-gradient(135deg,#2563eb 0%,#4f46e5 100%);box-shadow:0 12px 30px rgba(37,99,235,0.35);">
                    <a href="${resetURL}" style="display:inline-block;padding:18px 42px;font-size:15px;font-weight:700;letter-spacing:0.04em;color:#ffffff;text-decoration:none;border-radius:14px;font-family:'Poppins',Arial,sans-serif;">
                      RESET PASSWORD
                    </a>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:34px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:18px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 10px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;font-family:'Poppins',Arial,sans-serif;">
                      Can't click the button?
                    </p>
                    <p style="margin:0;font-size:14px;line-height:24px;color:#4b5563;word-break:break-all;font-family:'Poppins',Arial,sans-serif;">
                      Copy and paste this link into your browser:<br /><br />
                      <a href="${resetURL}" style="color:#2563eb;text-decoration:none;font-family:'Poppins',Arial,sans-serif;">${resetURL}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e5e7eb;padding-top:28px;">
                <tr>
                  <td>
                    <p style="margin:0 0 10px;font-size:15px;line-height:26px;color:#111827;font-weight:600;font-family:'Poppins',Arial,sans-serif;">
                      Didn’t request this?
                    </p>
                    <p style="margin:0;font-size:14px;line-height:26px;color:#6b7280;font-family:'Poppins',Arial,sans-serif;">
                      No action is required. Your current password will remain unchanged and your account is still secure.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:34px 50px 42px;background:#f9fafb;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 12px;font-size:13px;line-height:22px;color:#9ca3af;letter-spacing:0.04em;text-transform:uppercase;font-family:'Poppins',Arial,sans-serif;">
                Need Help?
              </p>

              <p style="margin:0 0 18px;font-size:14px;line-height:24px;color:#6b7280;font-family:'Poppins',Arial,sans-serif;">
                Contact our support team if you have any questions regarding your account security.
              </p>

              <p style="margin:0;font-size:12px;line-height:22px;color:#9ca3af;font-family:'Poppins',Arial,sans-serif;">
                © 2026 Wintreetech. All rights reserved.<br />
                support@wintreetech.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>


	`,
		);

		res.status(200).json({
			message: "Password reset link sent to email",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

//resetPassword;
export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await Auth.findOne({
			resetPasswordToken: token,
			resetPasswordExpire: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ message: "Invalid or expired token" });
		}

		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(password, salt);

		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save();

		res.status(200).json({
			message: "Password reset successful",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};
