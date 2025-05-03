import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    session: { // Keeping 'session' from the existing model
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
    },
    resource: { // Adding 'resource' from the new model
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource'
    },
    type: {
        type: String,
        enum: ['credit_spent', 'credit_earned', 'credit_bonus', 'credit_refund', 'signup_bonus'], // Merging enums
        required: [true, 'Transaction type is required']
    },
    amount: {
        type: Number,
        required: [true, 'Transaction amount is required']
    },
    description: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Transaction', TransactionSchema);