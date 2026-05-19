import multer from "multer";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype === "text/csv" ||
      file.mimetype === "application/json" ||
      file.originalname.toLowerCase().endsWith(".csv") ||
      file.originalname.toLowerCase().endsWith(".json");
    if (!ok) return cb(new Error("Only CSV or JSON files are allowed"));
    cb(null, true);
  },
});