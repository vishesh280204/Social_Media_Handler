import { model, Schema } from "mongoose";

export const activityLogSchema= new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    actionType:{
        type:String,
        enum:["POST_PUBLISHED","AI_REPLY"],
        required:true
    },
    description:{
        type:String,
        required:true
    },
    relatedPost:{
        type:Schema.Types.ObjectId,
        ref:"Post",
    },
    aiGenereatedText:{
        type:String
    }

},{timestamps:true})
 
export const ActivityLog= model("ActivityLog",activityLogSchema)