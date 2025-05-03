import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    skill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    learners: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        enum: ['text', 'video', 'pdf', 'link', 'other'],
        default: 'text'
    },
    resourceUrl: {
        type: String
    },
    creditCost: {
        type: Number,
        default: 1
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Resource', ResourceSchema);