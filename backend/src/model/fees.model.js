import mongoose from "mongoose";

const feesSchema = new mongoose.Schema(
    {
        forMonth:{
            type:String,
            enum:["January","February","March","April","May","June","July","August","September","October","November","December"],
            required:true,
        },
        forYear:{
            type:Number,
            required:true,
        },
        studentId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Student",
            required:true,
        },
        batchId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Batch",
            required:true,
        }
    },{
        timestamps:true,
    }
)

const Fees = mongoose.model("Fees",feesSchema)

export default Fees;