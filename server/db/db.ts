import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  try {
    console.log("URI:", process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("✅ Database connected");
  } catch (err) {
    console.error(err);
  }
};

export default connectDB;