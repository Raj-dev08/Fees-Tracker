import Batch from "../model/batch.model.js";
import Fees from "../model/fees.model.js";
import Student from "../model/student.model.js";
import User from "../model/user.model.js";

export const createBatch = async (req, res, next) => {
  try {
    const { user } = req;
    const { name, className, group , fees } = req.body;

    if (!name || !className || !group || !fees) {
      return res.status(400).json({ message: "name ,class and group are required" });
    }

    if( fees < 0 || group < 0 ){
      return res.status(400).json({ message: "fees and group cannot be negative" });
    }

    const batch = await Batch.create({
      name,
      class: className,
      group,
      owner: user._id,
      fees
    });

    await User.findByIdAndUpdate(user._id, {
      $push: { batches: batch._id },
    });

    res.status(201).json({ batch});
  } catch (error) {
    next(error);
  }
};

export const getMyBatches = async (req, res, next) => {
  try {
    const { user } = req;

    const batches = await Batch.find({ owner: user._id })
      .populate("students", "name mobileNumber")
      .sort({ createdAt: -1 });

    if (!batches){
        return res.status(404).json({ message: "No batches found" });
    }

    return res.status(200).json({ batches });
  } catch (error) {
    next(error);
  }
};

export const getBatchById = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;

    if( !id) {
        return res.status(400).json({ message: "Id is required" });
    }

    const batch = await Batch.findById(id).populate("students");


    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    if(batch.owner.toString() !== user._id.toString()){
        return res.status(401).json({ message: "Unauthorized access" });
    }
    return  res.status(200).json({ batch });
  } catch (error) {
    next(error);
  }
};

export const updateBatch = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const { name, className, group , fees } = req.body;

    if(!id){
        return res.status(400).json({ message: "Id is required" });
    }
    if (!name && !className && !group && !fees ) {
        return res.status(400).json({ message: "name ,class, id and group are required"})
    }

    const batch = await Batch.findById(id)

    if(!batch){
        return res.status(404).json({ message: "Batch not found" });
    }

    if(batch.owner.toString() !== user._id.toString()){
        return res.status(401).json({ message: "Unauthorized access" });
    }

    if(name){
        batch.name = name;
    }

    if(className){
        batch.class = className;
    }

    if(group){
      if(group > 0 ){
        batch.group = group;
      }   
    }

    if(fees){
      if(fees > 0 ){
        batch.fees = fees;
      }   
    }

    await batch.save();

    return res.status(200).json({ batch });  
  } catch (error) {
    next(error);
  }
};

export const deleteBatch = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;

    const batch = await Batch.findOneAndDelete({
      _id: id,
      owner: user._id,
    });

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    await Student.deleteMany({ batch: batch._id });

    await Fees.deleteMany({ batchId: batch._id });

    // remove from user.batches
    await User.findByIdAndUpdate(user._id, {
      $pull: { batches: batch._id },
    });

    return res.status(200).json({ message: "Batch deleted successfully" });
  } catch (error) {
    next(error);
  }
};
