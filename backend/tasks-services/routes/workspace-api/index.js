import { Router } from "express";
import {
  addWorkspaceMember,
  createWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
  getWorkspaceBySlug,
} from "../../controllers/workspace.controller.js";
import { getTaskDownloadLink } from "../../controllers/s3.controller.js";

const router = Router();

router.post("/create", createWorkspace);
router.get("/all", getAllWorkspaces);
router.get("/:slug", getWorkspaceBySlug);
router.post("/:slug/members", addWorkspaceMember);
router.delete("/:slug", deleteWorkspace);
router.post("/download", getTaskDownloadLink);
export default router;
