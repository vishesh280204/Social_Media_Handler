import { Router } from "express";
import { getActivity } from "../controllers/activity.controller.js";
import { protectAuthMiddleware } from "../middleware/auth.middleware.js";


export const activtiyRouter=Router()

activtiyRouter.get("/",protectAuthMiddleware,getActivity)