import express from "express";
import { fetchAwsCosts } from "../services/awsCostExplorer";
import { generateInsights } from "../services/insightEngine";

const router = express.Router();

router.get("/costs", async (_req, res) => {
  try {
    const data = await fetchAwsCosts();
    const insights = generateInsights(data);

    res.json({
      success: true,
      data,
      insights,
    });
  } catch (error: any) {
    console.error("AWS FULL ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;

