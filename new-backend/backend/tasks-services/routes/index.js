import { Router } from "express";
import taskRoutes from "./task-api/index.js";
import workspaceRoutes from "./workspace-api/index.js";

const router = Router();

router.use("/tasks/api/v1", taskRoutes);
router.use("/workspaces/api/v1", workspaceRoutes);

export default router;
