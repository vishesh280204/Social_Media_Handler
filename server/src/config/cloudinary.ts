
import { v2 as cloudinary } from "cloudinary"
import "dotenv/config"; 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME!,
    api_key:  process.env.CLOUDINARY_API_KEY!,
    api_secret:  process.env.CLOUDINARY_API_SECRET! 
})
console.log("#################################################")
console.log(process.env.CLOUDINARY_NAME);
console.log(process.env.CLOUDINARY_API_KEY);
console.log(process.env.CLOUDINARY_API_SECRET?.length);

try {
    const result = await cloudinary.api.ping();
    console.log(result);
} catch (err) {
    console.error(err);
}
export {cloudinary}
