import * as reviewController from '##/server/controllers/review.controller.js';
import { isAllowed } from '##/server/policies/api.policies.js';
import { withAsyncErrorHandling } from '##/server/utility/utility.js';

export default function routes(app) {
    // Create a new review
    app
        .route('/api/review/create')
        .all(isAllowed)
        .post(withAsyncErrorHandling(reviewController.createReview));

    // Get all reviews
    app
        .route('/api/review/getAll')
        .all(isAllowed)
        .get(withAsyncErrorHandling(reviewController.getAllReviews));

    // Get a specific review by ID
    app
        .route('/api/review/:reviewId')
        .all(isAllowed)
        .get(withAsyncErrorHandling(reviewController.getReviewById));

    // Update a review
    app
        .route('/api/review/update/:reviewId')
        .all(isAllowed)
        .patch(withAsyncErrorHandling(reviewController.updateReview));

    // Delete a review
    app
        .route('/api/review/delete/:reviewId')
        .all(isAllowed)
        .delete(withAsyncErrorHandling(reviewController.deleteReview));

    // Get reviews for a specific user
    app
        .route('/api/review/user/:userId')
        .all(isAllowed)
        .get(withAsyncErrorHandling(reviewController.getReviewsByUser));

    // Get reviews for a specific session
    app
        .route('/api/review/session/:sessionId')
        .all(isAllowed)
        .get(withAsyncErrorHandling(reviewController.getReviewsBySession));
}