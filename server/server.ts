import express from "express";
import cors from "cors"
import "dotenv/config"
import connectDB from "./db/db.js";

connectDB()
const app=express()

app.use(cors())
app.use(express.json())

 
const port = process.env.PORT || 5000
app.get("/",(req,res)=>{
    res.send("Hi server is live ")
})
app.listen(port, ()=>{
    console.log(`Server is running at port ${port}`)
})
