import * as transactionController from '##/server/controllers/transaction.controller.js';
import { isAllowed } from '##/server/policies/api.policies.js';
import { withAsyncErrorHandling } from '##/server/utility/utility.js';

export default function routes(app) {
    // Get user's transactions
    app
        .route('/api/transactions')
        .all(isAllowed)
        .get(withAsyncErrorHandling(transactionController.getUserTransactions));

    // Get transaction by ID
    app
        .route('/api/transactions/:transactionId')
        .all(isAllowed)
        .get(withAsyncErrorHandling(transactionController.getTransactionById));

    // Add credits to user (admin only)
    app
        .route('/api/transactions/credit/add')
        .all(isAllowed)
        .post(withAsyncErrorHandling(transactionController.addCreditsToUser));

    // Get transaction statistics
    app
        .route('/api/transactions/stats')
        .all(isAllowed)
        .get(withAsyncErrorHandling(transactionController.getTransactionStats));
}