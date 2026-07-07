import express from "express";
import cors from "cors"
import "dotenv/config"
import connectDB from "./src/db/db.js";
import type{ Request,Response } from "express";

await connectDB()
const app=express()

app.use(cors())
app.use(express.json())

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
