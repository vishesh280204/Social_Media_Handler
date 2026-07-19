
import { error, profile } from "node:console";
import { zernio } from "../config/zernio.js"
import { User } from "../models/user.model.js";
import type { Request,Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { Account } from "../models/account.model.js";



const getOrCreateZernioProfile= async(user:any):Promise<string>=>{
    try{

        //Fetching Connected Ids From Zernio
        const result = await zernio.profiles.listProfiles()
        const data =result.data as any;
        const profiles= Array.isArray(data)?data:(data?.profiles) || (data?.data) || []

        //Updating the User Profile
        if(profiles.length>0){
            const pid=profiles[0]._id || profiles[0].id
            await User.findByIdAndUpdate(user._id,
                { zernioProfileId: pid }
            )
            return pid
        }

        //Creating a new account
        const createResult= await zernio.profiles.createProfile({
            body: {name: `${user.name || user.email }'s Workpace`} as any,

        })
        const created=(createResult.data as any)?.profile || createResult.data
        const pid= created._id || created.id

        if(!pid){
            throw new Error("Failed to create Zernio Profile Id - no id  returned")
        }
        
        await User.findByIdAndUpdate(user._id,
            { zernioProfileId: pid}
        )
        return pid
        

    }
    catch(err:any){
        console.error("getOrCreateZernioProfile Error:", err?.message || err)

        throw err;
    }
}




//Generate OAuth authorization url
//GET /api/auth/:platform
export const generateAuthUrl=async (req:AuthRequest,res:Response) : Promise<void>=>{
    try{
        console.log("In generateAuthUrl")

        const {platform}=req.params!;
        const profileId=await getOrCreateZernioProfile(req.user)
        if (!profileId) {
            throw new Error("Profile ID not found");
        }
        
        const origin =req.headers.origin!;
        const redirectUrl=`${origin}/accounts`
        
        const result= await zernio.connect.getConnectUrl({
            path:{platform:platform as any},
            query:{
                profileId,
                redirect_url : redirectUrl
            }
        })

        const data= result.data as any;
        // console.log(result)
        // console.log("getConnectUrl response",JSON.stringify(data,null,2))

        const authUrl=data.authUrl
        if(!authUrl){
            throw new Error(`Zernio returned no authUrl. Full response: ${JSON.stringify(data)}`)
        }
        res.json({url: authUrl})

    }catch(err:any){
        res.status(500).json({message:err?.message || "Server Error"})
    }
}


// Sync connected accounts from Zernio into MongoDB
// GET /api/auth/sync
//This is for the accounts of profile like vishesh has twitter account and instagram account
export const syncAccounts= async (req:AuthRequest,res:Response) : Promise<void> =>{
    try{
        console.log("In syncAccounts ")
        //collecting connected zaccounts
        const {platform}= req.params!
        const profileId = await getOrCreateZernioProfile(req.user)
        const result= await zernio.accounts.listAccounts({
            query: {profileId} as any
        })
        const data=result.data as any
        const zernioAccounts:any[]= data?.accounts || (Array.isArray(data)? data : [])
        const supportedPlatforms=['facebook','linkedin','twitter','instagram']

        const syncedAccounts=[]
        
        //checking for the accounts one by one
        for(const zAccount of zernioAccounts){

            //checking for account id
            const zid= zAccount.id || zAccount._id
            if(!zid){
                console.warn("Skipping account with no ID :",zAccount)
                continue
            }

            //checking if account belongs to supported platform
            const rawPlatform= (zAccount.platform || zAccount.type || "").toLowerCase()
            const normalisedPlatform= supportedPlatforms.find((p)=>rawPlatform.includes(p))
            if(!normalisedPlatform){
                console.log("Skipping the unsupported platform : ",rawPlatform)
                continue
            }

            // Updating Account in Account Model
            const account = await Account.findOneAndUpdate(
                {zernioAccountId:zid},
                {
                    user:req.user._id,
                    platform:normalisedPlatform,
                    handle: zAccount.username || zAccount.name || zAccount.handle || "Unknown",
                    zernioAccountId:zid,
                    status:"connected",
                    avatarUrl:zAccount.avatarUrl || zAccount.picture || zAccount.profile_image_url,
                },
                {upsert:true,returnDocument:"after"}
                //upsert is for update the existing, and if not exist create the new one
                //returnDocument is for giving the information before or after updation into the account variable
            ) 
            syncedAccounts.push(account) 
        }
        res.json(syncedAccounts)

    }catch(err:any){
            res.status(500).json({message:err?.message || "Server error while syncing accounts"})
    }
}

 

