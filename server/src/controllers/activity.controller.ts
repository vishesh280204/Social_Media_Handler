import type{Response} from "express"
import { ActivityLog } from "../models/activityLog.model.js"
import type { AuthRequest } from "../middleware/auth.middleware.js"

//Get all activity
// GET api/activity
export const getActivity= async (req:AuthRequest,res:Response):Promise<void>=>{
    try {

        const activity= await ActivityLog.find({user:req.user._id}).sort({createdAt:-1}).limit(10).populate("relatedPost","content")

        if(!activity){
            res.status(404).json({message:"No activity found for the user"})
        }

        res.status(200).json(activity)

    } catch (error:any) {
        res.status(500).json({message:"Server error fetching the activity "})
    }

}