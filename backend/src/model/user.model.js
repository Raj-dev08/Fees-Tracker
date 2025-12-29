import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
        },
        password:{
            type:String,
            required:true,
            minlength:4
        },
        batches:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Batch",
            }
        ]
    }
)

const User = mongoose.model("User",userSchema)

export default User;