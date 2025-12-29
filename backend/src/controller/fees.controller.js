import Student from "../model/student.model.js";
import Fees from "../model/fees.model.js";
import { redis } from "../lib/redis.js";

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

        const cacheKey = `student:${studentId}:fees:${forMonth}:${forYear}`;
        if (await redis.exists(cacheKey)) {
            return res.status(409).json({ message: "Fees already added" });
        }

        const student = await Student.findById(studentId).populate("batch");

        if(!student){
            return res.status(404).json({ message: "Student not found"})
        }

        if(student.batch.owner.toString() !== user._id.toString()){
            return res.status(401).json({ message: "Unauthorized access"})
        }

        

        const alreadyPaid = await Fees.findOne({
            studentId: student._id,
            forMonth,
            forYear,
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
        await student.save();

        await redis.set(cacheKey,"1", "EX" , 60 * 60 * 24 * 30)

        return res.status(201).json({ fees });
    } catch (error) {
        next(error)
    }
}