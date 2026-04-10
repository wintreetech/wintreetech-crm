import express from "express";
import {
  createDevelopment,
  deleteDevelopment,
  deleteDevelopmentDocument,
  generateDevelopmentDownloadLink,
  getAllDevelopment,
  getDevelopmentById,
  getDevelopmentDocuments,
  updateDevelopment,
  uploadDevelopmentDocuments,
} from "../../controller/development.controller.js";
import { multerErrorHandler } from "../../middleware/multerErrorHandler.js";
import developmentUpload from "../../utils/developmentUpload.js";

const router = express.Router();

router.get("/", getAllDevelopment);
router.post("/", createDevelopment);
router.post(
  "/upload",
  developmentUpload.array("files", 10),
  uploadDevelopmentDocuments,
  multerErrorHandler
);
router.post("/download", generateDevelopmentDownloadLink);
router.get("/docs/:developmentId", getDevelopmentDocuments);
router.get("/docs/:developmentId/:sectionName", getDevelopmentDocuments);
router.delete("/document/:id", deleteDevelopmentDocument);
router.get("/:id", getDevelopmentById);
router.put("/:id", updateDevelopment);
router.delete("/:id", deleteDevelopment);

export default router;
