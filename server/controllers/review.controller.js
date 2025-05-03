import mongoose from 'mongoose';

import { handleError } from '##/server/utility/utility.js';

const Review = mongoose.model('Review');
const User = mongoose.model('User');
// const Session = mongoose.model('Session');

// Create a new review
async function createReview(req, res) {
    try {
        const { session, reviewer, reviewedUser, rating, comment } = req.body;

        // Validate MongoDB ObjectIds
        if (!mongoose.Types.ObjectId.isValid(session)) {
            return res.status(400).json({ message: 'Invalid session ID' });
        }

        if (!mongoose.Types.ObjectId.isValid(reviewer)) {
            return res.status(400).json({ message: 'Invalid reviewer ID' });
        }

        if (!mongoose.Types.ObjectId.isValid(reviewedUser)) {
            return res.status(400).json({ message: 'Invalid reviewed user ID' });
        }

        // Check if session exists
        const sessionExists = await Session.findById(session);
        if (!sessionExists) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Check if users exist
        const reviewerExists = await User.findById(reviewer);
        const reviewedUserExists = await User.findById(reviewedUser);

        if (!reviewerExists) {
            return res.status(404).json({ message: 'Reviewer not found' });
        }

        if (!reviewedUserExists) {
            return res.status(404).json({ message: 'Reviewed user not found' });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Create the review
        const newReview = new Review({
            session,
            reviewer,
            reviewedUser,
            rating,
            comment
        });

        const savedReview = await newReview.save();

        // Update the reviewedUser's reviews array
        await User.findByIdAndUpdate(
            reviewedUser,
            { $push: { reviews: savedReview._id } }
        );

        // Calculate and update the user's average rating
        const userReviews = await Review.find({ reviewedUser });
        const totalRating = userReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / userReviews.length;

        await User.findByIdAndUpdate(
            reviewedUser,
            { averageRating: parseFloat(averageRating.toFixed(1)) }
        );

        // Populate references for the response
        const populatedReview = await Review.findById(savedReview._id)
            .populate('session')
            .populate('reviewer')
            .populate('reviewedUser')
            .lean();

        return res.status(201).json(populatedReview);
    } catch (error) {
        return handleError(res, error);
    }
}

// Get review by ID
async function getReviewById(req, res) {
    try {
        const { reviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ message: 'Invalid review ID' });
        }

        const review = await Review.findById(reviewId)
            .populate('session')
            .populate('reviewer')
            .populate('reviewedUser');

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        return res.json(review);
    } catch (error) {
        return handleError(res, error);
    }
}

// Get all reviews
async function getAllReviews(req, res) {
    try {
        const reviews = await Review.find()
            .populate('session')
            .populate('reviewer')
            .populate('reviewedUser')
            .lean();

        return res.json({ reviews });
    } catch (error) {
        return handleError(res, error);
    }
}

// Get reviews by user (reviews about a specific user)
async function getReviewsByUser(req, res) {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }

        const reviews = await Review.find({ reviewedUser: userId })
            .populate('session')
            .populate('reviewer')
            .lean();

        return res.json({ reviews });
    } catch (error) {
        return handleError(res, error);
    }
}

// Get reviews by session
async function getReviewsBySession(req, res) {
    try {
        const { sessionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ message: 'Invalid session ID' });
        }

        const sessionExists = await Session.findById(sessionId);
        if (!sessionExists) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const reviews = await Review.find({ session: sessionId })
            .populate('reviewer')
            .populate('reviewedUser')
            .lean();

        return res.json({ reviews });
    } catch (error) {
        return handleError(res, error);
    }
}

// Update review
async function updateReview(req, res) {
    try {
        const { reviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ message: 'Invalid review ID' });
        }

        const { rating, comment } = req.body;

        const updateData = {};
        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Rating must be between 1 and 5' });
            }
            updateData.rating = rating;
        }

        if (comment !== undefined) {
            updateData.comment = comment;
        }

        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .populate('session')
            .populate('reviewer')
            .populate('reviewedUser');

        if (!updatedReview) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Recalculate and update the user's average rating
        const userReviews = await Review.find({ reviewedUser: updatedReview.reviewedUser._id });
        const totalRating = userReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / userReviews.length;

        await User.findByIdAndUpdate(
            updatedReview.reviewedUser._id,
            { averageRating: parseFloat(averageRating.toFixed(1)) }
        );

        return res.json(updatedReview);
    } catch (error) {
        return handleError(res, error);
    }
}

// Delete review
async function deleteReview(req, res) {
    try {
        const { reviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ message: 'Invalid review ID' });
        }

        const reviewToDelete = await Review.findById(reviewId);

        if (!reviewToDelete) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Store the reviewed user's ID before deleting the review
        const reviewedUserId = reviewToDelete.reviewedUser;

        // Delete the review
        await Review.findByIdAndDelete(reviewId);

        // Remove the review from the user's reviews array
        await User.findByIdAndUpdate(
            reviewedUserId,
            { $pull: { reviews: reviewId } }
        );

        // Recalculate and update average rating
        const remainingReviews = await Review.find({ reviewedUser: reviewedUserId });

        if (remainingReviews.length > 0) {
            const totalRating = remainingReviews.reduce((sum, review) => sum + review.rating, 0);
            const newAverageRating = totalRating / remainingReviews.length;

            await User.findByIdAndUpdate(
                reviewedUserId,
                { averageRating: parseFloat(newAverageRating.toFixed(1)) }
            );
        } else {
            // If no reviews left, reset average rating to 0
            await User.findByIdAndUpdate(
                reviewedUserId,
                { averageRating: 0 }
            );
        }

        return res.json({ message: 'Review deleted successfully', reviewId });
    } catch (error) {
        return handleError(res, error);
    }
}

export {
    createReview,
    getReviewById,
    getAllReviews,
    getReviewsByUser,
    getReviewsBySession,
    updateReview,
    deleteReview
};