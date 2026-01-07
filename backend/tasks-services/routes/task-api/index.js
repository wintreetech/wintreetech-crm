import { Router } from "express";
import {
  getMyTasksBoard,
  createMyTaskBoard,
} from "../../controllers/task.controller.js";

const router = Router();

router.get("/mytasks", getMyTasksBoard);
router.post("/mytasks", createMyTaskBoard);

export default router;
