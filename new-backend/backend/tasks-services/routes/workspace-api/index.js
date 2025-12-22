import { Router } from "express";
import {
  addWorkspaceMember,
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceBySlug,
} from "../../controllers/workspace.controller.js";

const router = Router();

router.post("/create", createWorkspace);
router.get("/all", getAllWorkspaces);
router.get("/:slug", getWorkspaceBySlug);
router.post("/:slug/members", addWorkspaceMember);

export default router;
