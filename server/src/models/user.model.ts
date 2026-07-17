import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"


export const userSchema= new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true, 
    },
    name:{
        type:String,
        required:true
    },
    zernioProfileId:{
        type:String
    }
},{timestamps:true});

export const User =mongoose.model("User",userSchema)

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next
    this.password=await bcrypt.hash(this.password,10)
    next;
})
