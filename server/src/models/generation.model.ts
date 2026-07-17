import mongoose, { model, Schema } from "mongoose";

export const generationSchema= new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    prompt:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    mediaUrl:{
        type:String
    },
    mediaType:{
        type:String,
        enum:['image','video',undefined]
    },
    tone:{
        type:String
    }

},{timestamps:true})

export const Generation= model("Generation",generationSchema)