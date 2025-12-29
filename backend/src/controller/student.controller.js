import mongoose from "mongoose";
import Student from "../model/student.model.js";
import Batch from "../model/batch.model.js";

export const addStudent = async (req, res, next) => {
  try {
    const { user } = req;
    const {
      name,
      mobileNumber,
      lastFeesPaidFor,
      admissionMonth,
      admissionYear,
      batchId,
    } = req.body;

    if (
      !name ||
      !lastFeesPaidFor ||
      !admissionMonth ||
      !admissionYear ||
      !batchId
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({ message: "Invalid batch id" });
    }

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    if (batch.owner.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const student = await Student.create({
      name,
      mobileNumber,
      lastFeesPaidFor,
      admissionMonth,
      admissionYear,
      batch: batch._id,
    });

    batch.students.push(student._id);
    await batch.save();

    return res.status(201).json({ student });
  } catch (error) {
    next(error);
  }
};

export const removeStudent = async (req, res, next) => {
  try {
    const { user } = req;
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student id" });
    }

    const student = await Student.findById(studentId).populate("batch");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.batch) {
      return res.status(400).json({ message: "Student has no batch" });
    }

    if (student.batch.owner.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    await Batch.findByIdAndUpdate(student.batch._id, {
      $pull: { students: student._id },
    });

    await student.deleteOne();

    return res.status(200).json({ message: "Student removed successfully" });
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req, res, next) => {
    try {
        const { user } = req;
        const { studentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: "Invalid id"})
        }

        const student = await Student.findById(studentId).populate("batch").populate("fees");

        if(!student){
            return res.status(404).json({ message: "Student not found"})
        }

        if(student.batch.owner.toString() !== user._id.toString()){
            return res.status(401).json({ message: "Unauthorized access"})
        }

        return res.status(200).json({ student });
    } catch (error) {
        next(error)
    }
}
