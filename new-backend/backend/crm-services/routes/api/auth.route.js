import { Router } from "express";

const router = Router();

import {
	AllUser,
	register,
	login,
	updateUser,
	deleteUser,
	logout,
} from "../../controller/auth.controller.js";

router.get("/alluser", AllUser);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
