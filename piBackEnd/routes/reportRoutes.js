import express from "express";
import * as reportController from "../controllers/reportController.js";

const router = express.Router();

router.post("/", reportController.createReport);
router.get("/", reportController.getAllReports);

router.get("/reports/:id", reportController.getReportById);
router.put("/reports/:id/status", reportController.updateReportStatus);
router.delete("/reports/:id", reportController.deleteReport);
router.get("/total/count", reportController.getTotalReports);
router.post('/update-status', reportController.updateReportStatus);


export default router;
