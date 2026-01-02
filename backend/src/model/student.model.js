import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },
        mobileNumber:{
            type:String,
        },
        lastFeesPaidFor:{
            type:String,
            enum:["January","February","March","April","May","June","July","August","September","October","November","December"],
            required:true,
        },
        lastFeesPaidForYear:{
            type:Number,
            required:true,
        },
        admissionMonth:{
            type:String,
            enum:["January","February","March","April","May","June","July","August","September","October","November","December"],
            required:true,
        },
        admissionYear:{
            type:Number,
            required:true,
        },
        batch:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Batch",
            required:true,
        },
        fees:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Fees",
            }
        ]
    },{
        timestamps:true,
    }
)

const Student = mongoose.model("Student",studentSchema)

export default Student;