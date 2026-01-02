import { Router } from "express";
import { addStudent, removeStudent, getStudentById, searchStudent } from "../controller/student.controller.js";

const router = Router()

router.get("/search", searchStudent);
router.post("/add-student", addStudent);
router.delete("/remove-student/:studentId", removeStudent);
router.get("/student/:studentId", getStudentById);

export default router;