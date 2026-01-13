import { Router } from "express";
import protect from "../../middleware/protect.js";

const router = Router();

import {
  AllUser,
  register,
  login,
  updateUser,
  deleteUser,
  logout,
} from "../../controller/auth.controller.js";

router.post("/login", login);

router.use(protect);
router.get("/alluser", AllUser);
router.post("/register", register);
router.post("/logout", logout);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
