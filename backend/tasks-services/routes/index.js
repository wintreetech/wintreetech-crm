import { Router } from "express";
import taskRoutes from "./task-api/index.js";
import workspaceRoutes from "./workspace-api/index.js";
import notificationRoutes from "./notification.routes.js";
import s3Routes from "./s3-routes/index.js";
import { protect } from "../middleware/protect.js";

const router = Router();

router.use(protect);

router.use("/tasks/api/v1", taskRoutes);
router.use("/workspaces/api/v1", workspaceRoutes);
router.use("/notifications/api/v1", notificationRoutes);
router.use("/s3/api/v1", s3Routes);

export default router;
