  // Get all accounts
  //GET /api/accounts

import type { Request, Response } from "express";
import { zernio } from "../config/zernio.js";
import { Account } from "../models/account.model.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

 const getAccounts= async (req:AuthRequest,res:Response):Promise<void>=>{
    try {
        const accounts = await Account.find({user: req.user._id})
        if(!accounts){
            res.status(400).json({message:"No accounts found for this user"})
        }
        res.status(200).json(accounts)

    } catch (error:any) {
        res.status(500).json({message: error?.message ||" Server error during fetching accounts for user"})
    }
}

// Add account
//POST/api/accounts/

 const addAccount = async (req:AuthRequest,res:Response):Promise<void>=>{
    try {
        const {platform,handle,avatarUrl}=req.body

        const account = await Account.create({
            user: req.user._id,
            platform,
            handle,
            avatarUrl
        })
        if(!account){
            res.status(400).json({message:"Unable to create account at the moment"})
        }
        res.status(201).json(account)

    } catch (error:any) {
        res.status(500).json({message:error?.message ||
            "Server Error adding account"
        })
    }
}

//Deleting account
//DELETE/api/accounts/:id
 const disconnectAccount=async (req:AuthRequest,res:Response):Promise<void>=>{
    try{
        //finding account
        const account = await Account.findOne({id:req.params._id,user:req.user._id})
        if(!account){
            res.status(404).json({message:"Account Not Found for disconnect"})
        }

        //deleting account from zernio
        if(account?.zernioAccountId){
            try{
                await zernio.accounts.deleteAccount({
                path: { accountId:account.zernioAccountId } 
                })
            }catch(error:any){ 
                res.status(500).json({message:"Server Error during deleting zernio account"})
            }
        }
        // deleting from database
        await account?.deleteOne()
        res.status(200).json({message:"Account disconnected Successfully"})

    }catch(error:any){
        res.status(500).json({message:error?.message ||
            "Server Error disconnecting account"
        })
    }
}

export {getAccounts,addAccount,disconnectAccount}