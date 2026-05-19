import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { exportCsv, exportPdf } from "../controllers/exportController";

const router = Router();
router.use(requireAuth);
router.get("/:id/csv", exportCsv);
router.get("/:id/pdf", exportPdf);
export default router;