import cron from "node-cron"
import { Post } from "../models/post.model.js"
import { Account } from "../models/account.model.js"
import { zernio } from "../config/zernio.js"
import { ActivityLog } from "../models/activityLog.model.js"
export const initScheduler = () => {
    // stars for year month day minute, if we add one more it will mean to execute every sec

    cron.schedule("* * * * * ",async ()=>{
        try {
            
            const now= new Date()
            const postsToPublish= await Post.find({status:"scheduled", scheduledFor:{$lte: now}})

            // Posting every scheduled post 
            for(const post of postsToPublish){
                try {
                    //getting connected zernio accounts for the user 
                    const accounts = await Account.find({
                        user: post.user,
                        platform: { $in: post.platforms },
                        status: "connected",
                        zernioAccountId: {$exists: true } 
                    }as any)
                    if(!accounts){
                        console.log("No accounts found for post",post._id)
                        continue
                    }
                    
                    const zernioPlatforms=accounts.map((acc)=>{
                        return ({
                            platform: acc.platform as any,
                            accountId: acc.zernioAccountId
                        })
                    })
                    
                    // creating the payload to be sent to the zernio for publishing post
                    const payload = {
                        content: post.content,
                        publishNow:true,
                        ...(post.mediaUrl ? {
                            
                                mediaItems:[{type: post.mediaType || "image"}]  ,
                                url:post.mediaUrl

                            }:{}),
                        platforms:zernioPlatforms
                    }

                    console.log(`Publish post : ${post._id} to Zernio with media: ${post.mediaUrl || "none"}`)

                    //Publishing through zernio
                    const response = await zernio.posts.createPost({
                        body: payload
                    })

                    const publishedPost= (response.data as any)?.post || response.data
                    if(!publishedPost){
                        throw new Error("Failed to get post object from Zernio response")
                    }
                    
                    //saving the status for the post
                    post.status="published"
                    await post.save()

                    //Adding activity log
                    const activity= await ActivityLog.create({
                        user: post.user,
                        actionType:"POST_PUBLISHED",
                        description:`Published post to ${accounts.map((a)=>(a.platform)).join(', ')}`,
                        relatedPost:post._id
                    })
                } catch (error:any) {
                     // failing to publish the post
                       console.log(`Failed to publish the post ${post._id} :`,
                        error?.response?.data || error?.mesage
                       )
                       post.status="failed"
                       await post.save()
                }
            }

            // Posts remaining to be published
            if(postsToPublish.length >0){
                console.log(`Evaluated ${postsToPublish.length} posts at ${now.toISOString()}`)
            }

         } catch (error) {
            console.log("Error in scheduler",error)
        }
        console.log("Scheduler is initialized")
    })

}    