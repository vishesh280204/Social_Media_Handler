import type { Response } from "express"
import type { AuthRequest } from "../middleware/auth.middleware.js"
import { GoogleGenAI } from "@google/genai"
import axios from "axios"
import { cloudinary } from "../config/cloudinary.js"
import { Generation } from "../models/generation.model.js"
import { Post } from "../models/post.model.js"
import { rejects } from "node:assert"


// Helper function to poll Leonardo ai

const pollLeonardoJob= async (generationId:string,apiKey:string): Promise<string> =>{
    
    const maxRetries=20
    const delay=2000

    for (let i=0;i<maxRetries;i++){
        try {
            const response= await axios.get(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
                {headers:{
                    accept:"application/json",
                    authorization:`Bearer ${apiKey}`
                    }
                }
            )
            const generation= response.data.generations_by_pk
            
            if(generation.status=="COMPLETE"){
                
                if(generation.generated_images && generation.generated_images.length>0){
                    return generation.generated_images[0].url
                }
                throw new Error ("Leonardo ai Generation completed but no images found")
            }
            if(generation.status=="FAILED"){
                throw new Error("Leonardo ai generation failed")
            }
        } catch (error:any) {
            console.error("Polling error:",error?.response?.data || error.message)
        }
        await new Promise((resolve)=> setTimeout(resolve, delay));
    }    
    throw new Error("Leonardo ai generation timed out")
    
}



// POST /api/post/generate

export const generatePost=async(req:AuthRequest,res:Response):Promise<void>=>{

    try {
        //generateImage is for whether to generate image or not
        const {prompt,tone,generateImage}=req.body
        const apiKey= process.env.GEMINI_API_KEY
        if(!apiKey){
            res.status(500).json({message:" Server error due to no gemini api key"})
            return
        }

        // Using GEMINI for post caption and prompt for image generation
        const ai=new GoogleGenAI({apiKey})
        const textResponse= await ai.models.generateContent({
            model:"gemini-2.5-flash",
            contents:`Generate a social media post based on this prompt: "${prompt}". 
            Tone: ${tone}. 
            Include relevant hashtags.
            Format the response as JSON with "content" and "imagePrompt" fields. 
            The "imagePrompt" should be a highly descriptive prompt for an image generator that complements the post.`

        })
        
        let content=""
        let imagePrompt=prompt
        try {
            // Extracting the content of text response using pattern matching
            const rawText=textResponse.text || "";
            const jsonMatch=rawText.match(/\{[\s\S]*\}/)
            const data=jsonMatch?JSON.parse(jsonMatch[0]):{ content:rawText , imagePrompt:prompt  }
            content=data.content;
            imagePrompt=data.imagePrompt;
        } catch (error) {
            content = textResponse.text || ""
        }
        let mediaUrl=''
        if(generateImage){
            try {
                const leonardoKey= process.env.LEONARDO_API_KEY!
                // we will get generationId in response of leonardoResponse
                const leoResponse=await axios.post(
                     "https://cloud.leonardo.ai/api/rest/v2/generations",
                        {
                            "public": false,
                            "model": "gpt-image-2",
                            "parameters": {
                                "quality": "LOW",
                                "prompt": imagePrompt,
                                "quantity": 1,
                                "width": 1024,
                                "height": 1024,
                                "prompt_enhance": "OFF"
                            }
                        },{
                            headers:{
                                accept: "application/json",
                                authorization: `Bearer ${leonardoKey}`,
                                "content-type": "application/json",
                            }
                        }
                )
                const generationId=leoResponse.data.generate.generationID
                const tempUrl= await pollLeonardoJob(generationId,leonardoKey)
    
                const uploadResult= await cloudinary.uploader.upload(tempUrl,
                    {folder:"ai-generations"}
                )
                mediaUrl=uploadResult.secure_url
            } catch (error:any) {
                console.error("Image generation failed :",error)
            }

        }
        const generation=await Generation.create({
            user:req.user._id,
            prompt,
            content,
            mediaUrl,
            mediaType:(mediaUrl)?"image":undefined,
            tone,
        })
        res.status(200).json(generation)

    } catch (error:any) {
        res.status(500).json({message:`Server error generating post ${error.message}` })
    }
}

// GET /api/posts/generations

export const getGenerations=async(req:AuthRequest,res:Response):Promise<void>=>{
    try {
        const generations= await Generation.find({user:req.user._id}).sort({createdAt :-1})
        if(generations.length<1){
            res.status(404).json({message:"No generation found for the user "})  
        }
        res.status(200).json(generations)
    } catch (error:any) {
        res.status(500).json({message:`Server error getting generations  ${error.message}`})  
    } 
}

// GET /api/posts

export const getPosts=async(req:AuthRequest,res:Response):Promise<void>=>{
    try {
        const posts = await Post.find({user:req.user._id})
        res.status(200).json(posts)
    } catch (error:any) {
        res.status(500).json({message:`Server error getting posts  ${error.message}`})  
    }
}


//POST /api/posts  
// It means to create and schedule a post 
export const schedulePost=async(req:AuthRequest,res:Response):Promise<void>=>{

    try {
        const {content,platforms,scheduledFor,status}=req.body
        let parsedPlatforms=platforms
        if(typeof platforms==="string"){
            try {
                parsedPlatforms=JSON.parse(platforms)
            } catch (error:any) {
                parsedPlatforms=platforms.split(',')
            }
        }

        let mediaUrl:string | undefined=req.body.mediaUrl; 
        let mediaType: "image" | "video" | undefined =req.body.mediaType


        if(req.file){
            const result = await new Promise<any>((resolve,reject)=>{
                const stream = cloudinary.uploader.upload_stream(
                    {
                    resource_type:"auto",
                    folder:"social-scheduler",
                    },
                    (error,result)=>{
                        if(error) reject(error);
                        else resolve(result)
                    }
                    
                )
                stream.end(req.file!.buffer);
            })
            mediaUrl=result.secure_url
            mediaType=result.resource_type === "video"? "video":"image"
        }

                    

        
        const post = await Post.create({
            user: req.user._id,
            content,
            ...(mediaUrl && { mediaUrl }),
            ...(mediaType && { mediaType }),
            platforms: parsedPlatforms,
            scheduledFor,
            status
        }); 
        
      res.status(200).json(post)
    } catch (error:any) {
        res.status(500).json({message:`Server error while scheduling post  ${error.message}`})  
    }
}


