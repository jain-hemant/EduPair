import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

import { handleError } from '##/server/utility/utility.js';
import { cloudinary, resourceUpload } from '##/server/config/cloudinary.js';

const Resource = mongoose.model('Resource');
const User = mongoose.model('User');
const Transaction = mongoose.model('Transaction');

// Multer middleware for single file upload
const uploadResourceFile = resourceUpload.single('resourceFile');

// Middleware to handle file upload
const handleFileUpload = (req, res, next) => {
    uploadResourceFile(req, res, function (err) {
        if (err) {
            return res.status(400).json({
                message: 'File upload error',
                error: err.message
            });
        }
        next();
    });
};

// Create a new learning resource
async function createResource(req, res) {
    try {
        const {
            title,
            skill,
            description,
            content,
            contentType,
            creditCost,
            difficulty
        } = req.body;

        // Resource URL from Cloudinary upload or from request body
        let resourceUrl = req.body.resourceUrl || '';

        // If file was uploaded via multer-cloudinary
        if (req.file) {
            resourceUrl = req.file.path; // Cloudinary URL from multer-cloudinary
        }

        // Create new resource
        const newResource = new Resource({
            title,
            skill,
            creator: req.user._id,
            description,
            content,
            contentType,
            resourceUrl,
            creditCost: creditCost || 1,
            difficulty: difficulty || 'beginner'
        });

        const resource = await newResource.save();

        return res.json({ resource });
    } catch (error) {
        return handleError(res, error);
    }
}

// Get all resources with filtering options
async function getAllResources(req, res) {
    try {
        // Build filter object from query params
        const filterObj = {};

        if (req.query.skill) filterObj.skill = req.query.skill;
        if (req.query.difficulty) filterObj.difficulty = req.query.difficulty;
        if (req.query.creator) filterObj.creator = req.query.creator;

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const resources = await Resource.find(filterObj)
            .populate('creator', 'name username avatar')
            .populate('skill', 'name category')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        const total = await Resource.countDocuments(filterObj);

        return res.json({
            resources,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return handleError(res, error);
    }
}

// Get resource by ID
async function getResourceById(req, res) {
    try {
        const { resourceId } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(resourceId)) {
            return res.status(400).json({ message: 'Invalid resource ID' });
        }

        const resource = await Resource.findById(resourceId)
            .populate('creator', 'name username avatar')
            .populate('skill', 'name category')
            .lean();

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        return res.json({ resource });
    } catch (error) {
        return handleError(res, error);
    }
}

// Update resource
async function updateResource(req, res) {
    try {
        const { resourceId } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(resourceId)) {
            return res.status(400).json({ message: 'Invalid resource ID' });
        }

        const resource = await Resource.findById(resourceId);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check if user is the creator of the resource
        if (resource.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this resource' });
        }

        const {
            title,
            description,
            content,
            contentType,
            creditCost,
            difficulty
        } = req.body;

        // Build update object dynamically
        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (content) updateData.content = content;
        if (contentType) updateData.contentType = contentType;
        if (creditCost) updateData.creditCost = creditCost;
        if (difficulty) updateData.difficulty = difficulty;

        // If a new URL is provided in the request body, use it
        if (req.body.resourceUrl) updateData.resourceUrl = req.body.resourceUrl;

        // If a new file was uploaded via multer-cloudinary
        if (req.file) {
            // If there's an existing cloudinary URL, delete the old file
            if (resource.resourceUrl && resource.resourceUrl.includes('cloudinary')) {
                try {
                    // Extract public_id from cloudinary URL
                    const publicId = getPublicIdFromUrl(resource.resourceUrl);
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudinaryError) {
                    console.error('Error deleting old file from Cloudinary:', cloudinaryError);
                    // Continue with update even if cloudinary delete fails
                }
            }
            // Set the new URL from the uploaded file
            updateData.resourceUrl = req.file.path;
        }

        updateData.updatedAt = Date.now();

        const updatedResource = await Resource.findByIdAndUpdate(
            resourceId,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .populate('creator', 'name username avatar')
            .populate('skill', 'name category')
            .lean();

        return res.json({ resource: updatedResource });
    } catch (error) {
        return handleError(res, error);
    }
}

// Delete resource
async function deleteResource(req, res) {
    try {
        const { resourceId } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(resourceId)) {
            return res.status(400).json({ message: 'Invalid resource ID' });
        }

        const resource = await Resource.findById(resourceId);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check if user is the creator of the resource
        if (resource.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this resource' });
        }

        // If there's a cloudinary resource URL, delete it
        if (resource.resourceUrl && resource.resourceUrl.includes('cloudinary')) {
            try {
                // Extract public_id from cloudinary URL
                const publicId = getPublicIdFromUrl(resource.resourceUrl);
                await cloudinary.uploader.destroy(publicId);
            } catch (cloudinaryError) {
                console.error('Error deleting file from Cloudinary:', cloudinaryError);
                // Continue with resource deletion even if cloudinary delete fails
            }
        }

        await Resource.findByIdAndDelete(resourceId);

        return res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        return handleError(res, error);
    }
}

// Access a resource (spend credits)
async function accessResource(req, res) {
    try {
        const { resourceId } = req.params;
        const userId = req.user._id;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(resourceId)) {
            return res.status(400).json({ message: 'Invalid resource ID' });
        }

        const resource = await Resource.findById(resourceId);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check if user already has access
        const userHasAccess = resource.learners.some(
            learnerId => learnerId.toString() === userId.toString()
        );

        if (userHasAccess) {
            return res.json({
                message: 'You already have access to this resource',
                resource
            });
        }

        // Check if user is the creator (creators don't need to pay)
        if (resource.creator.toString() === userId.toString()) {
            return res.json({
                message: 'You are the creator of this resource',
                resource
            });
        }

        // Get user's credit balance
        const user = await User.findById(userId);

        if (user.creditBalance < resource.creditCost) {
            return res.status(400).json({
                message: 'Insufficient credits to access this resource'
            });
        }

        // Create transaction for spent credits
        const spentTransaction = new Transaction({
            user: userId,
            resource: resourceId,
            type: 'credit_spent',
            amount: -resource.creditCost,
            description: `Access to resource: ${resource.title}`
        });

        // Create transaction for earned credits (for the creator)
        const earnedTransaction = new Transaction({
            user: resource.creator,
            resource: resourceId,
            type: 'credit_earned',
            amount: resource.creditCost,
            description: `Credits earned from resource: ${resource.title}`
        });

        // Update user's credit balance
        user.creditBalance -= resource.creditCost;
        await user.save();

        // Update creator's credit balance
        const creator = await User.findById(resource.creator);
        creator.creditBalance += resource.creditCost;
        await creator.save();

        // Add user to resource's learners list
        resource.learners.push(userId);
        await resource.save();

        // Save transactions
        await spentTransaction.save();
        await earnedTransaction.save();

        return res.json({
            message: 'Resource accessed successfully',
            resource,
            remainingCredits: user.creditBalance
        });
    } catch (error) {
        return handleError(res, error);
    }
}

// Get resources created by current user
async function getMyCreatedResources(req, res) {
    try {
        const userId = req.user._id;

        const resources = await Resource.find({ creator: userId })
            .populate('skill', 'name category')
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ resources });
    } catch (error) {
        return handleError(res, error);
    }
}

// Get resources accessed by current user
async function getMyAccessedResources(req, res) {
    try {
        const userId = req.user._id;

        const resources = await Resource.find({ learners: userId })
            .populate('creator', 'name username avatar')
            .populate('skill', 'name category')
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ resources });
    } catch (error) {
        return handleError(res, error);
    }
}

// Utility function to extract public_id from Cloudinary URL
function getPublicIdFromUrl(url) {
    // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/edupair/resources/abcdef.jpg
    // We need to extract 'edupair/resources/abcdef'
    const urlParts = url.split('/');
    const filenameParts = urlParts[urlParts.length - 1].split('.');
    const folderPath = urlParts[urlParts.length - 2];
    const filename = filenameParts[0];
    return `${folderPath}/${filename}`;
}

export {
    createResource,
    getAllResources,
    getResourceById,
    updateResource,
    deleteResource,
    accessResource,
    getMyCreatedResources,
    getMyAccessedResources,
    handleFileUpload
};