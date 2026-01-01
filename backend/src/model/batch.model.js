import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },
        class:{
            type:String,
            required:true,
        },
        group:{
            type:Number,
            default:1,
        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        fees:{
            type: Number,
            default:0,
            required: true
        },
        students:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Student",
            },
        ]
    }
)

const Batch = mongoose.model("Batch",batchSchema)

export default Batch;