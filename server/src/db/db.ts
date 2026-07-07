import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  try {
    

    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("✅ Database connected");
  } catch (err) {
    console.error(err);
    process.exit(1)
  }
};

export default connectDB;