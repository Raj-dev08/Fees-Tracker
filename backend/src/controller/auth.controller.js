import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/token.js";

export const signup = async (req, res,next) => {
    const { name, email, password } = req.body;
    try {

        if(!name || !email  || !password){
            return res.status(400).json({message: "All fields are required"});
        }
    
        if(password.length < 4){
            return res.status(400).json({message: "Password must be atleast 4 characters long"});
        }
    
        const user = await User.findOne({email});
    
        if(user){
            return res.status(400).json({message: "User with the email already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
    
        const newUser = new User({
            name,
            email,  
            password: hashedPassword
        });

        if(!newUser){
            return res.status(400).json({message: "Invalid user data"});
        }


        const savedUser = await newUser.save();

        return res.status(201).json({
            _id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
        });
        } catch (error) {
          next(error);
        }
};


export const login = async (req, res,next) => {
    const {email,password} = req.body;

    try {
        
        const user= await User.findOne({email});

        if(!user){
            return res.status(400).json({message: "User with the email does not exist"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid credentials"});
        }


        generateToken(user._id, res);
        
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        next(error);
    }

}


export const logout = async (req, res,next) => {
    try {
        res.cookie("jwt", "",{maxAge:0});
        res.status(200).json({message: "User logged out successfully"});    
    } catch (error) {
        next(error);
    }
}

export const checkAuth = (req, res,next) => {
    try {
      if(!req.user){
        res.status(401).json({message : "unauthorized access Please login!"});
      }  
      res.status(200).json(req.user);
    } catch (error) {
      next(error);
    }
  };
  
