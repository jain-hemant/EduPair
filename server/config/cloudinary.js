// Server-side setup for Cloudinary integration

// 1. Install required packages:
// npm install cloudinary multer multer-storage-cloudinary

// 2. Set up Cloudinary configuration (in server/config/cloudinary.js)
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage engine for different resource types
const createStorage = (folder) => new CloudinaryStorage({
    cloudinary,
    params: {
        folder: `edupair/${folder}`,
        resource_type: 'auto', // auto-detect resource type
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4'],
        transformation: [{ quality: 'auto' }]
    }
});

// Setup different upload middleware for different resource types
const resourceUpload = multer({
    storage: createStorage('resources'),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload middleware for profile pictures
const avatarUpload = multer({
    storage: createStorage('avatars'),
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

// For direct API usage (non-multer uploads)
const uploadToCloudinary = async (filePath, folder = 'resources') => {
    try {
        return await cloudinary.uploader.upload(filePath, {
            folder: `edupair/${folder}`
        });
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

export { cloudinary, resourceUpload, avatarUpload, uploadToCloudinary };