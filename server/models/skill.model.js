import mongoose from 'mongoose';
const SkillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String
    }
});

export const Skill = mongoose.model('Skill', SkillSchema); 