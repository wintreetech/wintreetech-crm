import { Router } from "express";

import SalesRoutes from "../api/sales.route.js";
import AuthRoutes from "../api/auth.route.js";

// router import
const router = Router();

// all routes
router.use("/sales", SalesRoutes);
router.use("/auth", AuthRoutes);

export default router;
