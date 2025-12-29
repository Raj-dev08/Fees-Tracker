import { Router } from "express";
import { addStudent, removeStudent, getStudentById } from "../controller/student.controller.js";

const router = Router()

router.post("/add-student", addStudent);
router.delete("/remove-student/:studentId", removeStudent);
router.get("/student/:studentId", getStudentById);

export default router;