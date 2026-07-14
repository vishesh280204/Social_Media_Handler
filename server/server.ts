import express from "express";
import cors from "cors"
import "dotenv/config"
import connectDB from "./src/db/db.js";
import type{ Request,Response } from "express";
import { router } from "./src/routes/authRoutes.js";
import socialAuthRouter from "./src/routes/socialAuthRoutes.js";

await connectDB()
const app=express()

app.use(cors())
app.use(express.json())
app.use("/api/auth/",router)
app.use("/api/oath",socialAuthRouter)
app.use((err:any,req:Request,res:Response)=>{
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
