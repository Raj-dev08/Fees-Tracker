import Student from "../model/student.model.js";
import Fees from "../model/fees.model.js";

const monthMap = {
    "January":0,
    "February":1,
    "March":2,
    "April":3,
    "May":4,
    "June":5,
    "July":6,
    "August":7,
    "September":8,
    "October":9,
    "November":10,
    "December":11,
  }

export const addFees = async (req, res, next) => {
    try {
        const { user } = req;
        const { studentId } = req.params;
        const { forMonth, forYear } = req.body;

        if(!studentId){
            return res.status(400).json({ message: "Student id is required"})
        }
        

        if( !forMonth || !forYear){
            return res.status(400).json({ message: "All fields are required"})
        }

        if(!["January","February","March","April","May","June","July","August","September","October","November","December"].includes(forMonth)){
            return res.status(400).json({ message: "Invalid month"})
        }

        if( typeof forYear !== "number" || forYear < 2025  ){
            return res.status(400).json({ message: "Invalid year"})
        }

        const student = await Student.findById(studentId).populate("batch");

        if(!student){
            return res.status(404).json({ message: "Student not found"})
        }

        if(!student.batch){
            return res.status(400).json({ message: "Student has no batch"})
        }


        if(student.batch.owner.toString() !== user._id.toString()){
            return res.status(401).json({ message: "Unauthorized access"})
        }

        const lastIndex =
        student.lastFeesPaidForYear * 12 + monthMap[student.lastFeesPaidFor];
        const newIndex =
        forYear * 12 + monthMap[forMonth];

        if (newIndex <= lastIndex) {
            return res.status(409).json({ message: "Fees already paid" });
        }

        if (newIndex !== lastIndex + 1) {
            return res.status(400).json({ message: "Clear previous month fees first" });
        }

        

        const alreadyPaid = await Fees.findOne({
            studentId: student._id,
            forMonth,
            forYear,
            batchId: student.batch._id
        })

        if(alreadyPaid){
            return res.status(409).json({ message: "Fees already paid"})
        }

        const fees = await Fees.create({
            forMonth,
            forYear,
            studentId: student._id,
            entryDate: new Date(),
        })

        student.fees.push(fees._id);
        student.lastFeesPaidFor = forMonth
        student.lastFeesPaidForYear = forYear
        await student.save();

        return res.status(201).json({ fees });
    } catch (error) {
        next(error)
    }
}