import { Router } from "express";

const router = Router();

import {
  AllUser,
  register,
  login,
  updateUser,
} from "../../controller/auth.controller.js";

router.get("/alluser", AllUser);
router.post("/register", register);
router.post("/login", login);
router.put("/:id", updateUser);

export default router;
