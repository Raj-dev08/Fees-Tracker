import mongoose from "mongoose";

const feesSchema = new mongoose.Schema(
    {
        amount:{
            type:Number,
            required:true,
        },
        forMonth:{
            type:String,
            enum:["January","February","March","April","May","June","July","August","September","October","November","December"],
            required:true,
        },
        forYear:{
            type:Number,
            required:true,
        },
        entryDate:{
            type:Date,
            default:Date.now,
        },
        studentId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Student",
            required:true,
        }
    },{
        timestamps:true,
    }
)

const Fees = mongoose.model("Fees",feesSchema)

export default Fees;