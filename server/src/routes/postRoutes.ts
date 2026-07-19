import { Router } from "express";
import { protectAuthMiddleware } from "../middleware/auth.middleware.js";
import { generatePost, getGenerations, getPosts, schedulePost } from "../controllers/post.controller.js";
import { upload } from "../config/multer.js";


export const postRouter=Router()

postRouter.post('/generate',protectAuthMiddleware,generatePost)
postRouter.get('/generations',protectAuthMiddleware,getGenerations)
postRouter.get('/',protectAuthMiddleware,getPosts)
postRouter.post('/',protectAuthMiddleware,upload.single("media"),schedulePost)    