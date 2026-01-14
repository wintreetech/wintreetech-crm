import express from "express";
import {
	getEntities,
	addEntities,
	deleteEntity,
} from "../../controller/Entity.controller.js";

const router = express.Router();

router.get("/", getEntities);
router.post("/", addEntities);
router.delete("/:name", deleteEntity);

export default router;
