import mongoose from 'mongoose';

import { handleError } from '##/server/utility/utility.js';

const Transaction = mongoose.model('Transaction');
const User = mongoose.model('User');

// Get user's transaction history
async function getUserTransactions(req, res) {
    try {
        const userId = req.user._id;

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Filter by transaction type if provided
        const filterObj = { user: userId };
        if (req.query.type) {
            filterObj.type = req.query.type;
        }

        const transactions = await Transaction.find(filterObj)
            .populate('resource', 'title')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        const total = await Transaction.countDocuments(filterObj);

        return res.json({
            transactions,
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

// Admin only: Add credits to user account
async function addCreditsToUser(req, res) {
    try {
        const { userId, amount, reason } = req.body;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid credit amount' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create transaction record
        const transaction = new Transaction({
            user: userId,
            type: 'admin_credit',
            amount,
            description: reason || 'Admin credit adjustment'
        });

        // Update user's credit balance
        user.creditBalance += amount;
        await user.save();
        await transaction.save();

        return res.json({
            message: 'Credits added successfully',
            transaction,
            newBalance: user.creditBalance
        });
    } catch (error) {
        return handleError(res, error);
    }
}

// Get transaction by ID
async function getTransactionById(req, res) {
    try {
        const { transactionId } = req.params;
        const userId = req.user._id;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(transactionId)) {
            return res.status(400).json({ message: 'Invalid transaction ID' });
        }

        const transaction = await Transaction.findById(transactionId)
            .populate('resource', 'title')
            .lean();

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check if the transaction belongs to the requesting user or admin
        if (transaction.user.toString() !== userId.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to view this transaction' });
        }

        return res.json({ transaction });
    } catch (error) {
        return handleError(res, error);
    }
}

// Get transaction statistics for the user
async function getTransactionStats(req, res) {
    try {
        const userId = req.user._id;

        const stats = await Transaction.aggregate([
            { $match: { user: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get total earned and spent
        let totalEarned = 0;
        let totalSpent = 0;

        stats.forEach(stat => {
            if (stat._id === 'credit_earned' || stat._id === 'admin_credit' || stat._id === 'signup_bonus') {
                totalEarned += stat.totalAmount;
            } else if (stat._id === 'credit_spent') {
                totalSpent += Math.abs(stat.totalAmount);
            }
        });

        return res.json({
            stats,
            summary: {
                totalEarned,
                totalSpent,
                net: totalEarned - totalSpent
            }
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export {
    getUserTransactions,
    addCreditsToUser,
    getTransactionById,
    getTransactionStats
};