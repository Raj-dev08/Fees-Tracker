import { Router } from "express";
import { createBatch, getMyBatches, getBatchById, updateBatch, deleteBatch } from "../controller/batch.controller.js";

const router = Router();

router.post("/", createBatch);
router.get("/", getMyBatches);
router.get("/:id", getBatchById);
router.put("/:id", updateBatch);
router.delete("/:id", deleteBatch);

export default router;