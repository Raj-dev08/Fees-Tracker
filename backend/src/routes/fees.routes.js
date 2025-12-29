import { Router } from "express";
import { addFees } from "../controller/fees.controller.js";

const router = Router();

router.post("/add-fees/:studentId", addFees);

export default router;