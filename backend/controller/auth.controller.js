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
      { expiresIn: "1d" }
    );

    // Set httpOnly cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // requires HTTPS in prod
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
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
  res.clearCookie("auth_token"), { path: "/" };
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
