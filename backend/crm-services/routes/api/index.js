import { Router } from "express";

import SalesRoutes from "../api/sales.route.js";
import AuthRoutes from "../api/auth.route.js";
import protect from "../../middleware/protect.js";
import processingUrlRoutes from "../api/processingUrl.route.js";
import CurrencyRoutes from "../api/currency.route.js";

// router import
const router = Router();

// all routes
router.use("/auth", AuthRoutes);

// Everything below is protected
router.use(protect);
router.use("/sales", SalesRoutes);
router.use("/processing-urls", processingUrlRoutes);
router.use("/currency", CurrencyRoutes);

export default router;
