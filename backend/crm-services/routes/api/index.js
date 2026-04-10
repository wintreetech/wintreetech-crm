import { Router } from "express";

import SalesRoutes from "../api/sales.route.js";
import AuthRoutes from "../api/auth.route.js";
import protect from "../../middleware/protect.js";
import processingUrlRoutes from "../api/processingUrl.route.js";
import CurrencyRoutes from "../api/currency.route.js";
import AcquirerRoutes from "../api/acquirer.route.js";
import EntityRoutes from "../api/Entity.route.js";
import DevelopmentRoutes from "../api/development.route.js";

// router import
const router = Router();

// all routes
router.use("/auth", AuthRoutes);

// Everything below is protected
router.use(protect);
router.use("/sales", SalesRoutes);
router.use("/processing-urls", processingUrlRoutes);
router.use("/currency", CurrencyRoutes);
router.use("/acquirer", AcquirerRoutes);
router.use("/entity", EntityRoutes);
router.use("/development", DevelopmentRoutes);

export default router;
