import { Router } from "express";

import SalesRoutes from "../api/sales.route.js";
import AuthRoutes from "../api/auth.route.js";
import protect from "../../middleware/protect.js";

// router import
const router = Router();

// all routes
router.use("/auth", AuthRoutes);

// Everything below is protected
router.use(protect);
router.use("/sales", SalesRoutes);

export default router;
