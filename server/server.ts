import express from "express";
import cors from "cors"
import "dotenv/config"
import connectDB from "./src/db/db.js";
import type{ NextFunction, Request,Response } from "express";
import { router } from "./src/routes/authRoutes.js";
import socialAuthRouter from "./src/routes/socialAuthRoutes.js";
import { accountRouter } from "./src/routes/accountRoutes.js";
import { postRouter } from "./src/routes/postRoutes.js";
import { activityRouter } from "./src/routes/activityRoutes.js";
import { initScheduler } from "./src/services/schedulerService.js";

await connectDB()
const app=express()

app.use(cors())
app.use(express.json())
app.use("/api/auth/",router)
app.use("/api/oauth",socialAuthRouter)
app.use("/api/accounts",accountRouter)
app.use("/api/posts",postRouter)
app.use("/api/activity",activityRouter)

// Initialize the scheduler
initScheduler()


app.use((err:any,req:Request,res:Response,next:NextFunction)=>{
    console.log(err)
    res.status(500).send(err?.response?.data?.message || err?.message)
})
  
const port = process.env.PORT || 5000
app.get("/",(req:Request,res:Response)=>{
    res.send("Hi server is live ")
})
app.listen(port, ()=>{
    console.log(`Server is running at port ${port}`)
})
