import { Router } from "express";
import taskRoutes from "./task-api/index.js";
import workspaceRoutes from "./workspace-api/index.js";
import notificationRoutes from "./notification.routes.js";
import s3Routes from "./s3-routes/index.js";
import { protect } from "../middleware/protect.js";

const API_VERSION = "/api/v1";

const router = Router();

router.use(protect);

router.use(API_VERSION, taskRoutes);
router.use(`/workspaces${API_VERSION}`, workspaceRoutes);
router.use(`/notifications${API_VERSION}`, notificationRoutes);
router.use(`/s3${API_VERSION}`, s3Routes);

export default router;
