import { Router } from "express";
import { getActivity } from "../controllers/activity.controller.js";
import { protectAuthMiddleware } from "../middleware/auth.middleware.js";


export const activityRouter=Router()

activityRouter.get("/",protectAuthMiddleware,getActivity)