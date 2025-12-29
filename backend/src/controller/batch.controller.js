import Batch from "../model/batch.model.js";
import User from "../model/user.model.js";

export const createBatch = async (req, res, next) => {
  try {
    const { user } = req;
    const { name, className, group } = req.body;

    if (!name || !className || !group) {
      return res.status(400).json({ message: "name ,class and group are required" });
    }

    const batch = await Batch.create({
      name,
      class: className,
      group,
      owner: user._id,
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

    const batch = await Batch.findById(id).populate("students", "name mobileNumber admissionYear admissionMonth lastFeesPaidFor");


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
    const { name, className, group } = req.body;

    if(!id){
        return res.status(400).json({ message: "Id is required" });
    }
    if (!name && !className && !group ) {
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
        batch.group = group;
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

    // remove from user.batches
    await User.findByIdAndUpdate(user._id, {
      $pull: { batches: batch._id },
    });

    return res.status(200).json({ message: "Batch deleted successfully" });
  } catch (error) {
    next(error);
  }
};
