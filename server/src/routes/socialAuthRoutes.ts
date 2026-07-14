import { Router } from "express";
import { generateAuthUrl, synAccounts } from "../controllers/socialAuth.controller.js";
import { protectAuthMiddleware } from "../middleware/auth.middleware.js";

const socialAuthRouter=Router()

socialAuthRouter.get('/:platform/url',protectAuthMiddleware,generateAuthUrl)

socialAuthRouter.get('/sync',protectAuthMiddleware,synAccounts)

export default socialAuthRouter