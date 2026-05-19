import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";
import {
  uploadDataset,
  listDatasets,
  getDataset,
  getInsights,
  getRows,
} from "../controllers/datasetController";
import { fetchAwsCosts } from "../services/awsCostExplorer";

const router = Router();
router.use(requireAuth);
router.post("/upload", upload.single("file"), uploadDataset);
router.get("/", listDatasets);
router.get("/:id", getDataset);
router.get("/:id/insights", getInsights);
router.get("/:id/rows", getRows);
router.get("/aws-costs", async (_req, res) => {
  try {
    const data = await fetchAwsCosts();
    res.json(data);
  } catch (e: any) {
    console.error("[aws-costs-error]", e);
    res.status(500).json({ error: e?.message || String(e) });
  }
});
export default router;