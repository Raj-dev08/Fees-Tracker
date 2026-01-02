import mongoose from "mongoose";
import Student from "../model/student.model.js";
import Batch from "../model/batch.model.js";
import Fees from "../model/fees.model.js";


export const addStudent = async (req, res, next) => {
  try {
    const { user } = req;
    const {
      name,
      mobileNumber,
      lastFeesPaidFor,
      lastFeesPaidForYear,
      admissionMonth,
      admissionYear,
      batchId,
    } = req.body;

    if (
      !name ||
      !lastFeesPaidFor ||
      !lastFeesPaidForYear ||
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

    if( typeof admissionYear !== "number" || admissionYear < 2020  || lastFeesPaidForYear < 2020 || typeof lastFeesPaidForYear !== "number"){
        return res.status(400).json({ message: "Invalid year"})
    }



    const student = await Student.create({
      name,
      mobileNumber,
      lastFeesPaidFor,
      lastFeesPaidForYear,
      admissionMonth,
      admissionYear,
      batch: batch._id,
    });

    const fees = await Fees.create({
      forMonth: lastFeesPaidFor,
      forYear: lastFeesPaidForYear,
      studentId: student._id
    });

    student.fees.push(fees._id)
    await student.save();

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

export const searchStudent = async (req, res, next) => {
  try {
    const { user } = req;
    const { name } = req.query;

    if(!name){
      return res.status(400).json({ message: "Missing required fields"})
    }

    let students = await Student.find({
      name: { $regex: name, $options: "i" },
    }).populate("batch");

    students = students.filter((student) => student.batch.owner.toString() === user._id.toString());

    return res.status(200).json({ students });
  } catch (error) {
    next(error)
  }
}