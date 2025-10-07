import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Auth from "../models/auth.model.js"; // Your Auth model
import dotenv from "dotenv";
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

		return res.status(201).json({
			message: `Registration successful! You can now give credentials to ${username} for log in`,
			data: {
				username,
				email,
				role,
				department,
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
		if (!user) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		// Compare password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		// Create JWT token
		const token = jwt.sign(
			{ id: user._id, email: user.email },
			process.env.JWT_SECRET,
			{ expiresIn: "1d" }
		);

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

export { register, login, AllUser };
