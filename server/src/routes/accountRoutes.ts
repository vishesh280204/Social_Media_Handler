import { Router } from "express";
import { protectAuthMiddleware } from "../middleware/auth.middleware.js";
import {  addAccount, disconnectAccount, getAccounts } from "../controllers/account.controller.js";

export const accountRouter=Router()

accountRouter.get('/',protectAuthMiddleware,getAccounts)
accountRouter.post('/',protectAuthMiddleware,addAccount)
accountRouter.get('/:id',protectAuthMiddleware,disconnectAccount)