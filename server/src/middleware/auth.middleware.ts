import type{ Request,Response,NextFunction } from "express"
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { User } from "../models/user.model.js"

export interface AuthRequest extends Request{
    user?:any
}

export const protectAuthMiddleware=async(req:AuthRequest,res: Response,next:NextFunction)=>{
    let token:any
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try{
            token = req.headers.authorization.split(" ")[1]
            // console.log("Authorization:", req.headers.authorization);
            // console.log("Token:", token);
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET_CODE!)
            req.user=await User.findById(decoded.id).select("-password")
            next()
        }
        catch(err:any){
            res.status(400).json({
                message: err?.message ??" Not authorized, token failed",

            })
        }
    }
    else{
        res.status(401).json({message:"Not authorized, token failed"})
    }
}