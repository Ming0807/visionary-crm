import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Upload options for product images
export const productUploadOptions = {
    folder: "visionary-shop/products",
    transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
    ],
};

// Upload options for profile images
export const profileUploadOptions = {
    folder: "visionary-shop/profiles",
    transformation: [
        { width: 200, height: 200, crop: "fill", gravity: "face" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
    ],
};

// Upload options for payment slips
export const slipUploadOptions = {
    folder: "visionary-shop/slips",
    transformation: [
        { width: 1200, crop: "limit" },
        { quality: "auto:good" },
    ],
};
