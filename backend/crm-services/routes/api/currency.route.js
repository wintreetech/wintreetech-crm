import { Router } from "express";
import {
	deleteCurrency,
	getCurrency,
	saveCurrency,
} from "../../controller/currency.controller.js";

const router = Router();

// GET → get single combination
router.get("/:companyId", getCurrency);

// POST → create or update single combination
router.post("/:companyId", saveCurrency);

// DELETE → remove combination
router.delete("/:companyId", deleteCurrency);

export default router;
