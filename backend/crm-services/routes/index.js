import { Router } from "express";
import { keys } from "../utils/keys.js";
import apiRoutes from "./api/index.js";

const router = Router();

const { apiUrl } = keys.app;
const api = `/${apiUrl}`;

// API Routes
router.use(api, apiRoutes);
router.use(api, (req, res) => res.status(404).json("No API route found"));

export default router;
